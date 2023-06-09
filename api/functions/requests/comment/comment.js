const { getFirestore, Timestamp, FieldValue } = require('../../modules');
const { userActivityHistory } = require('../utils/activity_history.util');

exports.createComment = async (req, res) => {
    const local_uid = res.locals.uid;
    const { text, post_id } = req.body;

    try {

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
            created_at: Timestamp.now().seconds,
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

        batch.set(comment_doc, { post_id_ref: post_id, user_uids: FieldValue.arrayUnion(local_uid) }, { merge: true });
        batch.create(user_info_doc, new_comment);
        batch.set(post, { total_comments: FieldValue.increment(1) }, { merge: true });

        await userActivityHistory({ 
            batch,
            local_uid,
            type: 'comment',
            comment_id: user_info_doc.id,
            text,
            post_id,
            uid: post_owner.owner.uid, 
            username: post_owner.owner.username, 
            profile_image: post_owner.owner.profile_image,
            occupation: post_owner.owner.occupation,
        }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        await batch.commit()
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        res.status(200).send({ message: 'Comment created!', comment: new_comment });

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.updateComment = async (req, res) => {
    const { comment_id, post_id, text } = req.body;

    try {

        const comment = getFirestore().collection('comments').doc(post_id);
        const user_comment_doc = comment.collection('users').doc(comment_id);

        const comment_exists = await (await comment.get()).exists;
        const user_comment_doc_exists = (await user_comment_doc.get()).exists;

        if(!comment_exists || !user_comment_doc_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        await user_comment_doc.set({ text, comment_edited: true }, { merge: true })
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

        const comment = getFirestore().collection('comments').doc(post_id);
        const user_comment = comment.collection('users').doc(comment_id)
        const comment_likes = comment.collection('liked_comments')
            .where('comment_id_ref', '==', comment_id);
        const comment_exists = await (await comment.get()).exists;

        const post = getFirestore().collection('posts').doc(post_id);
        const post_exists = await (await post.get()).exists;

        if(!comment_exists || !post_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        const batch = getFirestore().batch();
        
        await comment_likes.get().then(snapshot => {
            snapshot.forEach(doc => batch.delete(doc.ref));
        });
        batch.delete(user_comment);
        batch.set(post, { total_comments: FieldValue.increment(-1) }, { merge: true });

        await userActivityHistory({ batch, local_uid, batch, type: 'comment', post_id, comment_id })
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        await batch.commit()
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        res.status(200).send({ message: 'Comment deleted!' });

    } catch(error) {
        res.status(500).send(error);
    };
};