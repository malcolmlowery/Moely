const { getFirestore, FieldValue } = require('../../modules');

exports.hideComment = async (req, res) => {
    const local_uid = res.locals.uid;
    const { comment_id, post_id } = req.body;

    try {
        const post = getFirestore().collection('posts').doc(post_id);
        const comment = getFirestore().collection(`comments/${post_id}/users`).doc(comment_id);
        const hidden_comment = getFirestore().collection(`comments/${post_id}/hidden_comments`).doc(comment_id);

        const user_in_hidden_comments = (await hidden_comment.get()).data()
            .user_uids.find(uid => uid === local_uid);

        const post_exists = (await post.get()).exists;
        const comment_exists = (await comment.get()).exists;

        if(!post_exists || !comment_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        if(user_in_hidden_comments) {
            await hidden_comment.set({ user_uids: FieldValue.arrayRemove(local_uid) })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            res.status(200).send({ message: 'Comment is now unhidden.' })
            return;
        };

        if(!user_in_hidden_comments) {
            await hidden_comment.set({ user_uids: FieldValue.arrayUnion(local_uid) })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            res.status(200).send({ message: 'Comment is now hidden.' })
        }

    } catch(error) {
        res.status(500).send(error);
    };
};