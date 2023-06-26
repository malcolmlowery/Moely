const { getFirestore, FieldValue, Filter } = require('../../modules');

exports.createNewNotification = async (args) => {
    const { 
        batch, 
        local_uid, 
        notification_type, 
        notification_owner_uid, 
        timestamp, 
        content,
    } = args;

    const notification_root_doc = getFirestore().collection('notifications').doc(notification_owner_uid);
    const notification_sub_doc = notification_root_doc.collection('notification');
    const user = (await getFirestore().collection('users').doc(local_uid).get()).data();

    await notification_sub_doc
        .where('content.ref_id', '==', content.ref_id)
        .where('notification_owner_uid', '==', notification_owner_uid)
        .where('notification_type', '==', notification_type)
        .get().then(snapshot => {
    
            if(snapshot.empty) {
                batch.set(notification_root_doc, { total_notifications: FieldValue.increment(1) }, { merge: true });
                batch.create(notification_sub_doc.doc(), {
                    timestamp,
                    notification_type,
                    has_new_activity: true,
                    notification_owner_uid,
                    content: { ref_id: content.ref_id, text: content.text },
                    user_activity_uids: FieldValue.arrayUnion(user.uid),
                    user_activity_info: FieldValue.arrayUnion({
                        user_activity_createdAt: timestamp,
                        uid: user.uid,
                        username: user.username,
                        profileImage: user.profileImage,
                    }),
                });

                return;
            };

            if(!snapshot.empty) {
                const doc_data = snapshot.docs[snapshot.docs.length - 1];
                const user_in_user_activity_info = doc_data.data().user_activity_info.find(user => user.uid === local_uid);

                if(!doc_data.data().has_new_activity) {
                    batch.set(notification_root_doc, { total_notifications: FieldValue.increment(1) }, { merge: true });
                };

                if(user_in_user_activity_info && user_in_user_activity_info.uid === user.uid) {
                    batch.set(doc_data.ref, { 
                        user_activity_info: FieldValue.arrayRemove(user_in_user_activity_info),
                    }, { merge: true });

                    batch.set(doc_data.ref, { 
                        timestamp,
                        has_new_activity: true,
                        user_activity_info: FieldValue.arrayUnion({
                            ...user_in_user_activity_info,
                            user_activity_createdAt: timestamp,
                        }),
                    }, { merge: true });

                    return;
                };
                
                if(doc_data.data().user_activity_uids.length === 1) {
                    batch.set(doc_data.ref, {
                        timestamp,
                        has_new_activity: true,
                        user_activity_uids: FieldValue.arrayUnion(user.uid),
                        user_activity_info: FieldValue.arrayUnion({
                            user_activity_createdAt: timestamp,
                            uid: user.uid,
                            username: user.username,
                            profileImage: user.profileImage,
                        }),
                    }, { merge: true });

                    return;
                };

                if(doc_data.data().user_activity_uids.length === 2) {
                    const user_01 = doc_data.data().user_activity_info[0];
                    const user_02 = doc_data.data().user_activity_info[1];
                    const oldest_user_activity = user_01.timestamp > user_02.timestamp ? user_02 : user_01;
                
                    batch.set(doc_data.ref, {
                        user_activity_uids: FieldValue.arrayRemove(oldest_user_activity.uid),
                        user_activity_info: FieldValue.arrayRemove(oldest_user_activity),
                    }, { merge: true });

                    batch.set(doc_data.ref, {
                        timestamp,
                        has_new_activity: true,
                        user_activity_uids: FieldValue.arrayUnion(user.uid),
                        user_activity_info: FieldValue.arrayUnion({
                            user_activity_createdAt: timestamp,
                            uid: user.uid,
                            username: user.username,
                            profileImage: user.profileImage,
                        }),
                    }, { merge: true });

                    return;
                };
            };

        }).catch(error => { throw error });
};

exports.deleteNotificationEntry = async (args) => {
    const {
        batch, 
        local_uid, 
        notification_type, 
        notification_owner_uid,
        content 
    } = args;

    const notification_root_doc = getFirestore().collection('notifications').doc(notification_owner_uid);
    const notification_sub_doc = notification_root_doc.collection('notification');
    const notification_root_doc_exists = (await notification_root_doc.get()).exists;

    if(!notification_root_doc_exists) {
        return;
    };

    await notification_sub_doc
        .where('content.ref_id', '==', content.ref_id)
        .where('notification_owner_uid', '==', notification_owner_uid)
        .where('notification_type', '==', notification_type)
        .get().then(async (snapshot) => {

            if(snapshot.empty) {
                return;
            };

            const most_recent_comments = [];
            const notification_doc = snapshot.docs[snapshot.docs.length - 1];
            
            if(notification_type === 'new_comment') { 
                
                await getFirestore().collection(`comments/${content.ref_id}/users`)
                    .where('comment_id', '!=', content.comment_id)
                    .where('isPostOwner', '==', false)
                    .limit(2).orderBy('created_at', 'desc')
                    .get().then(snapshot => {
                        snapshot.forEach(doc => most_recent_comments.push(doc.data()))
                    }).catch((error) =>  console.log(error));  
                
                const same_user_in_most_recent_comments = most_recent_comments.length === 2 
                    && most_recent_comments[0].owner.uid === most_recent_comments[1].owner.uid;

                if(same_user_in_most_recent_comments) {
                    const current_user_in_user_activity_info = notification_doc.data().user_activity_info
                        .find(user => user.uid === local_uid)

                    await getFirestore().collection(`comments/${content.ref_id}/users`)
                        .where('owner.uid', 'not-in', [most_recent_comments[1].owner.uid, current_user_in_user_activity_info.uid, notification_owner_uid])
                        .orderBy('created_at', 'desc').limit(1)
                        .get().then(snapshot => {
                            most_recent_comments.pop()
                            snapshot.forEach(doc => most_recent_comments.push(doc.data()))
                        }).catch(() => { throw Error('An internal error occurred. Please try again') });  
                };

                if(notification_doc.data().has_new_activity === true && most_recent_comments.length === 0) {
                    batch.set(notification_root_doc, { total_notifications: FieldValue.increment(-1) }, { merge: true });
                };
        
                if(most_recent_comments.length === 0) {
                    batch.delete(notification_doc.ref);
                    return;
                };

                 batch.set(notification_doc.ref, {
                    timestamp: most_recent_comments[0].created_at,
                    user_activity_uids: most_recent_comments.length > 1 ? 
                        [most_recent_comments[0].owner.uid, most_recent_comments[1].owner.uid] :
                        [most_recent_comments[0].owner.uid],
                    user_activity_info: most_recent_comments.length > 1 ? 
                        [
                            {
                                user_activity_createdAt: most_recent_comments[0].created_at,
                                uid: most_recent_comments[0].owner.uid,
                                username: most_recent_comments[0].owner.username,
                                profileImage: most_recent_comments[0].owner.profileImage,
                            },
                            {
                                user_activity_createdAt: most_recent_comments[1].created_at,
                                uid: most_recent_comments[1].owner.uid,
                                username: most_recent_comments[1].owner.username,
                                profileImage: most_recent_comments[1].owner.profileImage,
                            }
                        ] : [
                            {
                                user_activity_createdAt: most_recent_comments[0].created_at,
                                uid: most_recent_comments[0].owner.uid,
                                username: most_recent_comments[0].owner.username,
                                profileImage: most_recent_comments[0].owner.profileImage,
                            },
                        ],
                }, { merge: true });

                return;
            };

            if(notification_type === 'post_liked') {
                await getFirestore().collection(`liked_posts/${content.ref_id}/users`)
                    .where('owner.uid', 'not-in', [notification_owner_uid, local_uid])
                    .limit(2)
                    .get().then(snapshot => {
                        snapshot.forEach(doc => most_recent_comments.push(doc.data()))
                    }).catch(() => { throw Error('An internal error occurred. Please try again') }); 
                    
                if(notification_doc.data().has_new_activity === true && most_recent_comments.length === 0) {
                    batch.set(notification_root_doc, { total_notifications: FieldValue.increment(-1) }, { merge: true });
                };
                    
                if(most_recent_comments.length === 0) {
                    batch.delete(notification_doc.ref)
                    return;
                };

                batch.set(notification_doc.ref, {
                    timestamp: most_recent_comments[0].liked_at,
                    user_activity_uids: most_recent_comments.length > 1 ? 
                        [most_recent_comments[0].owner.uid, most_recent_comments[1].owner.uid] :
                        [most_recent_comments[0].owner.uid],
                    user_activity_info: most_recent_comments.length > 1 ? 
                        [
                            {
                                user_activity_createdAt: most_recent_comments[0].liked_at,
                                uid: most_recent_comments[0].owner.uid,
                                username: most_recent_comments[0].owner.username,
                                profileImage: most_recent_comments[0].owner.profileImage,
                            },
                            {
                                user_activity_createdAt: most_recent_comments[1].liked_at,
                                uid: most_recent_comments[1].owner.uid,
                                username: most_recent_comments[1].owner.username,
                                profileImage: most_recent_comments[1].owner.profileImage,
                            }
                        ] : [
                            {
                                user_activity_createdAt: most_recent_comments[0].liked_at,
                                uid: most_recent_comments[0].owner.uid,
                                username: most_recent_comments[0].owner.username,
                                profileImage: most_recent_comments[0].owner.profileImage,
                            },
                        ],
                }, { merge: true });

                return;
            };

            if(notification_type === 'comment_liked') {
                await getFirestore().collection(`comments/${content.post_ref_id}/liked_comments`)
                    .where('owner.uid', 'not-in', [notification_owner_uid, local_uid])
                    .limit(2)
                    .get().then(snapshot => {
                        snapshot.forEach(doc => most_recent_comments.push(doc.data()))
                    }).catch(() => { throw Error('An internal error occurred. Please try again') }); 
                    
                if(notification_doc.data().has_new_activity === true && most_recent_comments.length === 0) {
                    batch.set(notification_root_doc, { total_notifications: FieldValue.increment(-1) }, { merge: true });
                };
                    
                if(most_recent_comments.length === 0) {
                    batch.delete(notification_doc.ref)
                    return;
                };

                batch.set(notification_doc.ref, {
                    timestamp: most_recent_comments[0].comment_liked_at,
                    user_activity_uids: most_recent_comments.length > 1 ? 
                        [most_recent_comments[0].owner.uid, most_recent_comments[1].owner.uid] :
                        [most_recent_comments[0].owner.uid],
                    user_activity_info: most_recent_comments.length > 1 ? 
                        [
                            {
                                user_activity_createdAt: most_recent_comments[0].comment_liked_at,
                                uid: most_recent_comments[0].owner.uid,
                                username: most_recent_comments[0].owner.username,
                                profileImage: most_recent_comments[0].owner.profileImage,
                            },
                            {
                                user_activity_createdAt: most_recent_comments[1].comment_liked_at,
                                uid: most_recent_comments[1].owner.uid,
                                username: most_recent_comments[1].owner.username,
                                profileImage: most_recent_comments[1].owner.profileImage,
                            }
                        ] : [
                            {
                                user_activity_createdAt: most_recent_comments[0].comment_liked_at,
                                uid: most_recent_comments[0].owner.uid,
                                username: most_recent_comments[0].owner.username,
                                profileImage: most_recent_comments[0].owner.profileImage,
                            },
                        ],
                }, { merge: true });

                return;
            };

            if(notification_type === 'new_follower') {
                await getFirestore().collection(`followers/${content.ref_id}/users`)
                    .where('owner.uid', '!=', local_uid)
                    .limit(2).orderBy('followed_on', 'desc')
                    .get().then(snapshot => {
                        snapshot.forEach(doc => most_recent_comments.push(doc.data()))
                    }).catch((error) =>  console.log(error));  
                
                const same_user_in_most_recent_comments = most_recent_comments.length === 2 
                    && most_recent_comments[0].owner.uid === most_recent_comments[1].owner.uid;

                if(same_user_in_most_recent_comments) {
                    const current_user_in_user_activity_info = notification_doc.data().user_activity_info
                        .find(user => user.uid === local_uid)

                    await getFirestore().collection(`following/${content.ref_id}/users`)
                        .where('owner.uid', 'not-in', [most_recent_comments[1].owner.uid, current_user_in_user_activity_info.uid, notification_owner_uid])
                        .orderBy('followed_on', 'desc').limit(1)
                        .get().then(snapshot => {
                            most_recent_comments.pop()
                            snapshot.forEach(doc => most_recent_comments.push(doc.data()))
                        }).catch(() => { throw Error('An internal error occurred. Please try again') });  
                };

                if(notification_doc.data().has_new_activity === true && most_recent_comments.length === 0) {
                    batch.set(notification_root_doc, { total_notifications: FieldValue.increment(-1) }, { merge: true });
                };
        
                if(most_recent_comments.length === 0) {
                    batch.delete(notification_doc.ref);
                    return;
                };

                batch.set(notification_doc.ref, {
                    timestamp: most_recent_comments[0].followed_on,
                    user_activity_uids: most_recent_comments.length > 1 ? 
                        [most_recent_comments[0].owner.uid, most_recent_comments[1].owner.uid] :
                        [most_recent_comments[0].owner.uid],
                    user_activity_info: most_recent_comments.length > 1 ? 
                        [
                            {
                                user_activity_createdAt: most_recent_comments[0].followed_on,
                                uid: most_recent_comments[0].owner.uid,
                                username: most_recent_comments[0].owner.username,
                                profileImage: most_recent_comments[0].owner.profileImage,
                            },
                            {
                                user_activity_createdAt: most_recent_comments[1].followed_on,
                                uid: most_recent_comments[1].owner.uid,
                                username: most_recent_comments[1].owner.username,
                                profileImage: most_recent_comments[1].owner.profileImage,
                            }
                        ] : [
                            {
                                user_activity_createdAt: most_recent_comments[0].followed_on,
                                uid: most_recent_comments[0].owner.uid,
                                username: most_recent_comments[0].owner.username,
                                profileImage: most_recent_comments[0].owner.profileImage,
                            },
                        ],
                }, { merge: true });

                return;
            };

        }).catch(error => { throw error });
};