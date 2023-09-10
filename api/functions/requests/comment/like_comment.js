const { getFirestore, Timestamp, FieldValue } = require('../../modules');
const { createNewNotification, deleteNotificationEntry } = require('../notifications/notifications');
const { userActivityHistory } = require('../utils/activity_history.util');
const { Expo } = require('expo-server-sdk');
let expo = new Expo();

exports.likeComment = async (req, res) => {
    const local_uid = res.locals.uid;
    const { comment_id, post_id, comment_liked } = req.body;

    try {
        
        const timestamp = Timestamp.now().seconds;
        const liked_comment_doc_empty = await getFirestore().collection(`comments/${post_id}/liked_comments`)
            .where('comment_id_ref', '==', comment_id)
            .where('owner.uid', '==', local_uid)
            .get().then(snapshot => snapshot.empty);

        if(liked_comment_doc_empty && !comment_liked || !liked_comment_doc_empty && comment_liked) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        const comment = getFirestore().collection(`comments/${post_id}/users`).doc(comment_id);
        const liked_comment_doc = getFirestore().collection(`comments/${post_id}/liked_comments`).doc();
        const post = getFirestore().collection('posts').doc(post_id);

        const post_exists = (await post.get()).exists;
        const comment_exists = (await comment.get()).exists;

        if(!post_exists || !comment_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        const comment_data = (await comment.get()).data()

        if(comment_liked) {
            const { username, profile_image, occupation } = await getFirestore().collection('users').doc(local_uid)
                .get().then(doc => doc.data())
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            const batch = getFirestore().batch();

            batch.create(liked_comment_doc, { 
                comment_liked_at: timestamp,
                comment_id_ref: comment_id,
                owner: { 
                    uid: local_uid, 
                    profile_image, 
                    occupation, 
                    username 
                },
            });

            batch.set(comment, { total_likes: FieldValue.increment(1) }, { merge: true });

            await userActivityHistory({ 
                batch,
                local_uid,
                type: 'comment_like',
                uid: comment_data.owner.uid, 
                username: comment_data.owner.username, 
                profile_image: comment_data.owner.profile_image,
                comment_id,
                post_id,
                timestamp,
                text: comment_data.text,
                occupation: comment_data.owner.occupation,
            }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            const post_is_hidden =  await getFirestore().collection('hidden_posts')
                .where('post_id_ref', '==', post_id)
                .where('user_uids', 'array-contains', local_uid)
                .get().then(snapshot => {
                    if(snapshot.size === 0) return false;
                    return true;
                });

            if(!post_is_hidden) {
                if(comment_data.owner.uid !== local_uid) {
                    await createNewNotification({ 
                        batch, 
                        timestamp, 
                        local_uid, 
                        notification_type: 'comment_liked',
                        notification_owner_uid: comment_data?.owner.uid, 
                        content: { 
                            ref_id: post_id, 
                            text: comment_data.text,
                        },
                    }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });
                };
            };

            await batch.commit()
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            if(comment_data.owner.uid !== local_uid && !post_is_hidden) {
                const { push_token } = await getFirestore().collection('users')
                    .doc(comment_data.owner.uid).get().then(doc => doc.data());
                    
                const { total_notifications } = await getFirestore().collection('notifications')
                    .doc(comment_data.owner.uid).get().then(doc => doc.data()); 

                if(push_token) {
                    await expo.sendPushNotificationsAsync([
                        {
                            to: push_token,
                            title: 'Moely',
                            body: username + ' likes your comment!',
                            data: { url: `home/post/${post_id}`, params: { notification_action: 'comment_liked' } },
                            badge: total_notifications,
                        },
                    ]);
                };
            };

            res.status(200).send({ message: 'Comment liked!', comment_liked: true });
        }

        if(!comment_liked) {
            const post_data = (await post.get()).data();
            const batch = getFirestore().batch();
            
            await getFirestore().collection(`comments/${post_id}/liked_comments`)
                .where('comment_id_ref', '==', comment_id)
                .where('owner.uid', '==', local_uid)
                .get().then(snapshot => {
                    batch.delete(snapshot.docs[snapshot.docs.length - 1].ref)
                })

            batch.set(comment, { total_likes: FieldValue.increment(-1) }, { merge: true });

            await userActivityHistory({ 
                batch, local_uid, 
                type: 'comment_like', 
                post_id,
                comment_id,
                timestamp,
                other_user_uid: comment_data?.owner.uid, 
            }).catch(() => { throw Error('An internal error occurred. Please try again') });
            
            if(comment_data.owner.uid !== local_uid) {
                await deleteNotificationEntry({ 
                    batch, 
                    timestamp, 
                    local_uid, 
                    notification_type: 'comment_liked',
                    notification_owner_uid: comment_data?.owner.uid, 
                    content: { 
                        ref_id: comment_id, 
                        post_ref_id: post_id, 
                    },
                }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });
            };

            await batch.commit()
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            res.status(200).send({ message: 'Comment unliked!', comment_liked: false });
        }

    } catch(error) {
        res.status(500).send(error);
    };
};