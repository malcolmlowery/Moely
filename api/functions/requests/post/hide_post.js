const { getFirestore, FieldValue } = require('../../modules');

exports.hidePost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { post_id } = req.body;

    try {

        await getFirestore().collection('hidden_posts').doc(post_id)
            .set({ post_id_ref: post_id, user_uids: FieldValue.arrayUnion(local_uid) }, { merge: true })
            .catch(() => { throw 'There was an error performing request. Please try again.' });

        res.status(200).send({ message: 'This post is now hidden', post_id });

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.unhidePost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { post_id } = req.body;

    try {

        await getFirestore().collection('hidden_posts').doc(post_id)
            .set({ post_id_ref: post_id, user_uids: FieldValue.arrayRemove(local_uid) }, { merge: true })
            .catch(() => { throw 'There was an error performing request. Please try again.' });

        res.status(200).send({ message: 'This post is now unhidden', post_id });

    } catch(error) {
        res.status(500).send(error);
    };
};