const { getFirestore, Timestamp, FieldValue } = require('../../modules');
const { createNewNotification, deleteNotificationEntry } = require('../notifications/notifications');
const { userActivityHistory } = require('../utils/activity_history.util');
const { Expo } = require('expo-server-sdk');
let expo = new Expo();

exports.createComment = async (req, res) => {
    const local_uid = res.locals.uid;
    const { text, post_id } = req.body;

    try {

        const timestamp = Timestamp.now().seconds;
        const comment_doc = getFirestore().collection('comments').doc(post_id);
        const user_info_doc = getFirestore().collection(`comments/${post_id}/users`).doc();
        const post = getFirestore().collection('posts').doc(post_id);

        const post_exists = (await post.get()).exists;

        if(!post_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        const post_owner = (await post.get()).data();
        const { username, profile_image, occupation } = await getFirestore().collection('users').doc(local_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        const new_comment = {
            comment_id: user_info_doc.id,
            post_id_ref: post_id,
            created_at: timestamp,
            isPostOwner: post_owner.owner.uid === local_uid && true,
            text,
            total_likes: 0,
            owner: {
                uid: local_uid,
                username,
                profile_image,
                occupation,
            },
        };

        const batch = getFirestore().batch();

        batch.set(comment_doc, { post_id_ref: post_id, user_uids: FieldValue.arrayUnion(local_uid), total_comments: FieldValue.increment(1) }, { merge: true });
        batch.create(user_info_doc, new_comment);
        batch.set(post, { total_comments: FieldValue.increment(1) }, { merge: true });

        await userActivityHistory({ 
            batch,
            local_uid,
            type: 'comment',
            comment_id: user_info_doc.id,
            text: post_owner.text,
            post_id,
            timestamp,
            other_user_uid: post_owner.owner.uid, 
            username: post_owner.owner.username, 
            profile_image: post_owner.owner.profile_image,
            occupation: post_owner.owner.occupation,
        }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });
        
        if(post_owner.owner.uid !== local_uid) {
            await createNewNotification({ 
                batch, 
                timestamp, 
                local_uid, 
                notification_type: 'new_comment',
                notification_owner_uid: post_owner?.owner.uid, 
                content: { ref_id: post_id, comment_id: user_info_doc.id, text: post_owner.text },
            }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });
        };

        await batch.commit()
            .catch(() => { throw Error('An internal error occurred. Please try again') });

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
                        body: username + ' commented on your post!',
                        data: { url: `home/post/${post_id}`, params: { notification_action: 'new_comment' } },
                        badge: total_notifications,
                    },
                ]);
            };
        };
        
        res.status(200).send({ 
            message: 'Comment created!', 
            comment: {
                ...new_comment,
                is_comment_owner: new_comment.owner.uid === local_uid ? true : false
            },
        });

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.updateComment = async (req, res) => {
    const local_uid = res.locals.uid;
    const { comment_id, post_id, text } = req.body;

    try {

        const batch = getFirestore().batch();
        const comment = getFirestore().collection('comments').doc(post_id);
        const user_comment_doc = comment.collection('users').doc(comment_id);

        const comment_exists = await (await comment.get()).exists;
        const user_comment_doc_exists = (await user_comment_doc.get()).exists;

        if(!comment_exists || !user_comment_doc_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        batch.set(user_comment_doc, { text, comment_edited: true }, { merge: true });

        await getFirestore().collectionGroup('notification')
            .where('content.ref_id', '==', comment_id)
            .where('notification_owner_uid', '==', local_uid)
            .where('notification_type', '==', 'comment_liked')
            .get().then(snapshot => {
                console.log(snapshot.size)
                if(snapshot.empty) return;
                const doc = snapshot.docs[snapshot.docs.length -1];

                batch.set(doc.ref, { 
                    content: { text },
                }, { merge: true });
            });

        // await getFirestore().collectionGroup('activities')
        //     .where('post_id_ref', '==', post_id)
        //     .where('comment_id', '==', comment_id)
        //     .get().then(snapshot => {
        //         if(snapshot.empty) return;
        //         snapshot.forEach(doc => {
        //             batch.set(doc.ref, { text }, { merge: true })
        //         });
        //     });

        await batch.commit()
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        res.status(200).send({ message: 'Comment updated!', text, comment_edited: true });

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.deleteComment = async (req, res) => {
    const local_uid = res.locals.uid;
    const { comment_id, post_id } = req.body;

    try {

        const comment_root_doc = getFirestore().collection('comments').doc(post_id);
        const user_comment = comment_root_doc.collection('users').doc(comment_id)
        const comment_likes = comment_root_doc.collection('liked_comments')
            .where('comment_id_ref', '==', comment_id);
        const comment_exists = await (await user_comment.get()).exists;

        const multiple_comments = await comment_root_doc.collection('users')
            .where('post_id_ref', '==', post_id).where('owner.uid', '==', local_uid)
            .count().get().then(value => value.data().count)
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        const post = getFirestore().collection('posts').doc(post_id);
        const post_exists = await (await post.get()).exists;

        if(!comment_exists || !post_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        const post_owner = (await post.get()).data();
        const batch = getFirestore().batch();
        
        await comment_likes.get().then(snapshot => {
            snapshot.forEach(doc => batch.delete(doc.ref));
        }).catch(() => { throw Error('An internal error occurred. Please try again') });;

        batch.set(comment_root_doc, { 
            total_comments: FieldValue.increment(-1), 
            user_uids: multiple_comments === 1 ? FieldValue.arrayRemove(local_uid) : FieldValue.arrayUnion(local_uid)
        }, { merge: true });

        batch.delete(user_comment);
        batch.set(post, { total_comments: FieldValue.increment(-1) }, { merge: true });

        await userActivityHistory({ 
            batch, local_uid, 
            type: 'comment', 
            post_id,
            comment_id,
            other_user_uid: post_owner?.owner.uid, 
        }).catch(() => { throw Error('An internal error occurred. Please try again') });

        if(post_owner.owner.uid !== local_uid) {
            await deleteNotificationEntry({ 
                batch, 
                local_uid, 
                notification_type: 'new_comment',
                notification_owner_uid: post_owner.owner.uid, 
                content: { ref_id: post_id, comment_id },
            }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });
        };

        const total_comments = (await comment_root_doc.collection('users').count().get()).data().count;

        if(total_comments === 1) {
            batch.delete(comment_root_doc);
        };

        await batch.commit()
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        res.status(200).send({ message: 'Comment deleted!' });

    } catch(error) {
        res.status(500).send(error);
    };
};