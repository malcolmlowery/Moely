const { getFirestore, Timestamp, FieldValue } = require('../../modules');
const { createNewNotification, deleteNotificationEntry } = require('../notifications/notifications');
const { userActivityHistory } = require('../utils/activity_history.util');
const { Expo } = require('expo-server-sdk');
let expo = new Expo();

exports.likePost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { post_id, post_liked } = req.body;

    try {

        const batch = getFirestore().batch();
        const timestamp = Timestamp.now().seconds;
        const post = getFirestore().collection('posts').doc(post_id);
        const liked_post = getFirestore().collection('liked_posts').doc(post_id);
        const user_in_liked_post_subcollection = liked_post.collection('users').doc(local_uid);

        const post_exists = (await post.get()).exists;
        const user_exists = (await getFirestore().collection(`liked_posts/${post_id}/users`).doc(local_uid).get()).exists;

        if(!post_exists || post_liked && user_exists || !post_liked && !user_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return
        };

        const post_owner = (await post.get()).data();

        if(post_liked) {

            const { username, profile_image, uid } = await getFirestore().collection('users').doc(local_uid)
                .get().then(doc => doc.data())
                .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            batch.set(liked_post, { post_id_ref: post_id, user_uids: FieldValue.arrayUnion(local_uid)}, { merge: true });
            batch.set(post, { total_likes: FieldValue.increment(1) }, { merge: true });
            batch.create(user_in_liked_post_subcollection, { 
                liked_at: timestamp,
                owner: {
                    uid,
                    username, 
                    profile_image,
                },
            });

            await userActivityHistory({ 
                batch,
                local_uid,
                type: 'like',
                timestamp,
                other_user_uid: post_owner?.owner.uid, 
                username: post_owner?.owner.username, 
                profile_image: post_owner?.owner.profile_image,
                post_id,
                occupation: post_owner?.owner.occupation,
                text: post_owner?.text 
            }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            if(post_owner.owner.uid !== local_uid) {
                await createNewNotification({ 
                    batch, 
                    timestamp, 
                    local_uid, 
                    notification_type: 'post_liked',
                    notification_owner_uid: post_owner?.owner.uid, 
                    content: { ref_id: post_id, text: post_owner.text },
                }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });
            };

            await batch.commit()
                .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            if(post_owner.owner.uid !== local_uid) {
                const { push_token } = await getFirestore().collection('users')
                    .doc(post_owner?.owner.uid).get().then(doc => doc.data());

                if(push_token) {
                    const { total_notifications } = await getFirestore().collection('notifications')
                        .doc(post_owner?.owner.uid).get().then(doc => doc.data()); 

                    await expo.sendPushNotificationsAsync([
                        {
                            to: push_token,
                            title: 'Moely',
                            body: username + ' likes your post!',
                            data: { url: `home/post/${post_id}`, params: { notification_action: 'post_liked' } },
                            badge: total_notifications,
                        },
                    ]);
                };
            };

            res.status(200).send({ message: 'Post liked!', post_liked: true, uid: post_owner.owner.uid });
            return;
        } 
        
        if(!post_liked) {
            batch.set(liked_post, { user_uids: FieldValue.arrayRemove(local_uid) }, { merge: true });
            batch.delete(user_in_liked_post_subcollection);
            batch.set(post, { total_likes: FieldValue.increment(-1) }, { merge: true });

            await userActivityHistory({ 
                batch, local_uid, 
                type: 'like', 
                post_id,
                other_user_uid: post_owner?.owner.uid, 
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            if(post_owner.owner.uid !== local_uid) {
                await deleteNotificationEntry({ 
                    batch, 
                    local_uid, 
                    notification_type: 'post_liked',
                    notification_owner_uid: post_owner?.owner.uid, 
                    content: { ref_id: post_id },
                }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });
            };
            
            await batch.commit()
                .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            res.status(200).send({ message: 'Post unliked!', post_liked: false, uid: post_owner.owner.uid });
            return;
        }

    } catch(error) {
        res.status(500).send(error);
    };
};