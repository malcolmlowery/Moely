const { getFirestore, Timestamp, FieldValue } = require('../../modules');

exports.likeComment = async (req, res) => {
    const local_uid = res.locals.uid;
    const { comment_id, comment_liked } = req.body;

    try {
        const comment_id = getFirestore().collection('liked_comments').doc().id;
        const comment_doc = getFirestore().collection('liked_comments').doc(comment_id);
        const user_info = getFirestore().collection(`liked_comments/${comment_id}/users`).doc();
        const post = getFirestore().collection('posts').doc(post_id);

        const { username, profile_image, occupation } = await getFirestore().collection('users').doc(local_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        const new_comment = {
            comment_id,
            created_at: Timestamp.now().seconds,
            text,
            owner: {
                uid: local_uid,
                username,
                profile_image,
                occupation,
            },
        };

        const batch = getFirestore().batch();

        batch.create(comment_doc, { post_id_ref: post_id, user_uids: FieldValue.arrayUnion(local_uid) });
        batch.create(user_info, new_comment);
        batch.set(post, { total_likes: FieldValue.increment(1) }, { merge: true });

        await batch.commit()
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        res.status(200).send({});

    } catch(error) {
        res.status(500).send(error);
    };
};