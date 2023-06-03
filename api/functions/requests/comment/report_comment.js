const { getFirestore, FieldValue, Timestamp } = require('../../modules');

exports.reportComment = async (req, res) => {
    const local_uid = res.locals.uid;
    const { comment_id, post_id } = req.body;

    try {
        const post = getFirestore().collection('posts').doc(post_id);
        const comment = getFirestore().collection(`comments/${post_id}/users`).doc(comment_id);
        const reported_comment = getFirestore().collection(`comments/${post_id}/reported_posts`).doc(comment_id);

        const post_exists = (await post.get()).exists;
        const comment_exists = (await comment.get()).exists;

        if(!post_exists || !comment_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        await reported_comment.set({ 
            reported_at: Timestamp.now().seconds,
            reported_total: FieldValue.increment(1),
            user_uids: FieldValue.arrayUnion(local_uid),
        }).catch(() => { throw Error('An internal error occurred. Please try again') });

        const reported_total = await reported_comment.get().then(doc => doc.data().reported_total)
            .catch(() => { throw 'There was an error performing request. Please try again.' });

        if(reported_total >= 3) {
            await comment.set({ flagged_post: true }, { merge: true })
                .catch(() => { throw 'There was an error performing request. Please try again.' });
        };

        res.status(200).send({ message: 'This comment has been reported.' })

    } catch(error) {
        res.status(500).send(error);
    };
};