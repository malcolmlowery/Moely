const { getFirestore, Timestamp, FieldValue } = require('../../modules');

exports.createComment = async (req, res) => {
    const local_uid = res.locals.uid;
    const { text, post_id } = req.body;

    try {
        const comment_id = getFirestore().collection('comments').doc().id;

        const { username, occupation, profile_image } = await getFirestore().collection('users').doc(local_uid)
            .get().then(snapshot => snapshot.data())
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        const comment = {
            created_at: Timestamp.now().seconds,
            post_id_ref: post_id,
            comment_id,
            comment_edited: false,
            text,
            total_likes: 0,
            owner: {
                uid: local_uid,
                username,
                profile_image,
                occupation,
            },
        };

        const post_exists = await getFirestore().collection('posts').doc(post_id)
            .get().then(doc => doc.exists);

        if(!post_exists) {
            res.status(400).send({ message: 'This post is no longer available', post_deleted: true });
        }

        await getFirestore().collection('comments').doc(comment_id)
            .create(comment).catch(() => { throw Error('An internal error occurred. Please try again') });

        await getFirestore().collection('posts').doc(post_id)
            .get().then(async (doc) => {
                if(!doc.exists) return;
                await doc.ref.set({ total_comments: FieldValue.increment(1) }, { merge: true });
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

        res.status(200).send({ message: 'Comment created!', comment });

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.updateComment = async (req, res) => {
    const { comment_id, text } = req.body;

    try {

        const comment = getFirestore().collection('comments').doc(comment_id);
        const comment_exists = await (await comment.get()).exists;

        if(!comment_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        await comment.set({ text, comment_edited: true }, { merge: true })
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        res.status(200).send({ message: 'Comment updated!', text, comment_edited: true });

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.deleteComment = async (req, res) => {
    const { comment_id, post_id } = req.body;

    try {

        const comment = getFirestore().collection('comments').doc(comment_id);
        const comment_exists = await (await comment.get()).exists;

        const post = getFirestore().collection('posts').doc(post_id);
        const post_exists = await (await post.get()).exists;

        if(!comment_exists || !post_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };

        await comment.delete()
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        await post.set({ total_comments: FieldValue.increment(-1) }, { merge: true })
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        res.status(200).send({ message: 'Comment deleted!' });

    } catch(error) {
        res.status(500).send(error);
    };
};