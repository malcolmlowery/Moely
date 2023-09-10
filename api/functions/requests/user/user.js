const { functions, getAuth, getFirestore, Timestamp, FieldValue } = require('../../modules');

exports.createUser = functions.https.onRequest(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user_doc = getFirestore().collection('users').doc();

        await getAuth().createUser({ displayName: username, email, password, uid: user_doc.id })
            .catch((error) => { throw error });

        await user_doc.create({ uid: user_doc.id, username, created_at: Timestamp.now().seconds })
            .catch(() => { throw 'There was an error creating your profile. Please try again.' });
            
        res.status(200).send({ message: 'Account created successfully!' });

    } catch(error) {
        res.status(500).send(error);
    };
});

exports.pushToken = async (req, res) => {
    const local_uid = res.locals.uid;
    const { push_token } = req.body;

    try {
        await getFirestore().collection('users').doc(local_uid).set({ push_token }, { merge: true })
            .catch(() => { throw 'There was an error creating your profile. Please try again.' });
            
        res.status(200).send({ message: 'Push Token Saved' });

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.deletePushToken = async (req, res) => {
    const local_uid = res.locals.uid;

    try {
        await getFirestore().collection('users').doc(local_uid).set({ push_token: null }, { merge: true })
            .catch(() => { throw 'There was an error creating your profile. Please try again. Status: P/TK' });
            
        res.status(200).send({ message: 'Push Token Deleted' });

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.getUserProfile = async (req, res) => {
    const local_uid = res.locals.uid;
    const { user_profile_uid, notification_action } = req.query;
    
    try {

        if(notification_action) {
            await getFirestore().collection(`notifications/${local_uid}/notification`)
                .where('notification_owner_uid', '==', local_uid)
                .where('content.ref_id', '==', user_profile_uid)
                .where('notification_type', '==', 'new_follower')
                .get().then(async (snapshot) => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref;
                    if(snapshot.docs[snapshot.docs.length - 1].data().has_new_activity === true) {
                        await getFirestore().collection('notifications').doc(local_uid)
                            .set({ total_notifications: FieldValue.increment(-1) }, { merge: true });
                    }
                    await doc.set({ has_new_activity: false }, { merge: true });
                });
        };

        const is_following_user = await getFirestore().collection(`following/${local_uid}/users`)
            .where('owner.uid', '==', user_profile_uid).get()
            .then(snapshot => {
                if(snapshot.empty) return false;
                return true;
            }).catch(() => { throw 'There was an error creating your profile. Please try again.' });

        const {
            uid,
            username, 
            profile_image, 
            cover_photo, 
            location, 
            occupation, 
            about_me,
            important_to_me,
            place_of_work
        } = await getFirestore().collection('users').doc(user_profile_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw 'There was an error creating your profile. Please try again.' });

        const user = { 
            following_user: is_following_user,
            uid,
            username, 
            profile_image, 
            cover_photo, 
            location, 
            occupation, 
            about_me,
            important_to_me,
            place_of_work,
        };

        res.status(200).send(user);

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.getAccountInfo = async (req, res) => {
    const local_uid = res.locals.uid;

    try {
        const account_info = await getFirestore().collection('users').doc(local_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw Error('There was an error updating your profile. Please try again.') });

        res.status(200).send(account_info);

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.updateUserProfile = async (req, res) => {
    const local_uid = res.locals.uid;
    const { username, about_me, location, occupation, place_of_work, important_to_me } = req.body;
    
    const user = getFirestore().collection('users').doc(local_uid);
    const user_in_subcollections = getFirestore().collectionGroup('users')
        .where('owner.uid', '==', local_uid);
    const user_in_liked_comments_subcollections = getFirestore().collectionGroup('liked_comments')
        .where('owner.uid', '==', local_uid);
    const activity_in_user_activity_history_subcollection = getFirestore().collectionGroup('activities')
        .where('content_owner_uid', '==', local_uid);
    const posts = getFirestore().collection('posts')
        .where('owner.uid', '==', local_uid);

    // Add transaction for updating user data in the notifications collection

    try {
        const user_exists = (await user.get()).exists
        const number_of_posts = await posts
            .count().get()
            .then(value => value.data().count)
            .catch(error => { throw error });

        const user_in_subcollections_count = await user_in_subcollections
            .count().get()
            .then(value => value.data().count)
            .catch(error => { throw error });

        const user_comment_likes_subcollections_count = await user_in_liked_comments_subcollections
            .count().get()
            .then(value => value.data().count)
            .catch(error => { throw error });

        const activity_in_user_activity_history_subcollection_count = await activity_in_user_activity_history_subcollection
            .count().get()
            .then(value => value.data().count)
            .catch(error => { throw error });
            
        const batch = getFirestore().batch();
        
        if(user_exists) {
            batch.set(user, { username, about_me, location, occupation, place_of_work, important_to_me }, { merge: true });
        }

        if(number_of_posts > 0) {
            await posts.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { username, occupation }}, { merge: true });
                });
            });
        };

        if(user_comment_likes_subcollections_count > 0) {
            await user_in_liked_comments_subcollections.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { username, occupation }}, { merge: true });
                });
            });
        };

        if(user_in_subcollections_count > 0) {
            await user_in_subcollections.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { username, occupation }}, { merge: true });
                });
            });
        };

        if(activity_in_user_activity_history_subcollection_count > 0) {
            await activity_in_user_activity_history_subcollection.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { username, occupation }, { merge: true });
                });
            });
        };

        await batch.commit()
            .catch(() => { throw Error('There was an error updating your profile. Please try again.') });

        await getAuth().updateUser(local_uid, { displayName: username })
            .catch(error => { throw error });

        const updated_user_info = await getFirestore().collection('users').doc(local_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw Error('There was an error updating your profile. Please try again.') });

        res.send(updated_user_info);

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.getBlockedUsers = async (req, res) => {
    const local_uid = res.locals.uid;

    try {
        const blocked_user_uids = [];
        const blocked_users = [];

        const blocked_user_doc = await getFirestore().collection('blocked_users').doc(local_uid).get()
            .catch(() => { throw Error('There was an error with your request. Please try again') });

        if(!blocked_user_doc.exists) return res.status(200).send(blocked_users);
        blocked_user_uids.push(...blocked_user_doc.data().user_uids)

        await getFirestore().collection('users').where('uid', 'in', blocked_user_uids)
            .get().then(snapshot => {
                if(snapshot.empty) return;
                snapshot.forEach(doc => {
                    blocked_users.push({ 
                        uid: doc.data().uid,
                        username: doc.data().username,
                        occupation: doc.data().occupation,
                    })
                });
            }).catch(() => { throw Error('There was an error with your request. Please try again') });

        res.status(200).send(blocked_users);
        
    } catch(error) {
        res.status(500).send(error);
    }
};

exports.blockUser = async (req, res) => {
    const local_uid = res.locals.uid;
    const { user_profile_uid } = req.body;

    try {
        const user_profile_exists = await getFirestore().collection('users').doc(user_profile_uid)
            .get().then(doc => doc.exists);

        if(user_profile_exists) {
            const batch = getFirestore().batch();

            // Get blocked user records
            await getFirestore().collection(`followers/${user_profile_uid}/users`)
                .where('owner.uid', '==', local_uid).get()
                .then(snapshot => {
                    if(snapshot.empty) return;
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref;
                    batch.delete(doc)
                }).catch(() => { throw Error('There was an error with your request. Please try again') });

            await getFirestore().collection(`following/${local_uid}/users`)
                .where('owner.uid', '==', user_profile_uid).get()
                .then(snapshot => {
                    if(snapshot.empty) return;
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref;
                    batch.delete(doc)
                }).catch(() => { throw Error('There was an error with your request. Please try again') });

            const block_user = getFirestore().collection('blocked_users').doc(local_uid);
            batch.set(block_user, { user_uids: FieldValue.arrayUnion(user_profile_uid) }, { merge: true });

            await batch.commit()
                .catch(() => { throw Error('There was an error with your request. Please try again') });
        };

        res.status(200).send({ message: 'This user is now blocked!' });
    
    } catch(error) {
        res.status(500).send(error);
    };
};

exports.unblockUser = async (req, res) => {
    const local_uid = res.locals.uid;
    const { blocked_uid } = req.body;

    try {
        await getFirestore().collection('blocked_users').doc(local_uid)
            .get().then(async (doc) => {
                if(!doc.exists) return;
                if(doc.data().user_uids.length === 1) {
                    await doc.ref.delete()
                    return;
                };
                await doc.ref.set({ user_uids: FieldValue.arrayRemove(blocked_uid) }, { merge: true });
            }).catch(() => { throw Error('There was an error with your request. Please try again') });

        res.status(200).send({ message: 'User is now unblocked!' });
        
    } catch {
        res.status(500).send(error);
    }
};

exports.deleteUserAccount = async (req, res) => {
    const local_uid = res.locals.uid;

    try {
        
        await getAuth().deleteUser(local_uid)
            .catch(() => { throw Error('There was an error with your request. Please try again') });
            
        res.status(200).send({ message: 'User account deleted' });
    
    } catch(error) {
        res.status(500).send(error);
    };
};