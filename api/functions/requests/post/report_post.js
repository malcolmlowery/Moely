const { getFirestore, Timestamp, FieldValue } = require('../../modules');

exports.reportPost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { post_id } = req.body;

    try {

        const reported_post = getFirestore().collection('reported_posts').doc(post_id);

        const user_in_user_uids = await reported_post.get().then(doc => {
            if(!doc.exists) return undefined;
            return doc.data().user_uids.find(uid => uid === local_uid);
        }).catch(() => { throw 'There was an error performing request. Please try again.' });

        if(user_in_user_uids) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return;
        };
       
        await reported_post.set({ 
            post_id_ref: post_id, 
            reported_at: Timestamp.now().seconds,
            reported_total: FieldValue.increment(1),
            user_uids: FieldValue.arrayUnion(local_uid),
        }, { merge: true })
        .catch(() => { throw 'There was an error performing request. Please try again.' });

        const reported_total = await reported_post.get().then(doc => doc.data().reported_total)
            .catch(() => { throw 'There was an error performing request. Please try again.' });
        
        if(reported_total === 4) {
            const post = getFirestore().collection('posts').doc(post_id);
            await post.set({ flagged_post: true }, { merge: true })
                .catch(() => { throw 'There was an error performing request. Please try again.' });
        };

        res.status(200).send({ message: 'This post has been reported' });

    } catch(error) {
        res.status(500).send(error);
    };
};