const { getFirestore, Timestamp, FieldValue } = require('../../modules');

exports.likePost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { post_id, post_liked } = req.body;

    try {

        const post = getFirestore().collection('posts').doc(post_id);
        const liked_post = getFirestore().collection('liked_posts').doc(post_id);
        const post_exists = (await post.get()).exists;
        const user_exists = await (await getFirestore().collection(`liked_posts/${post_id}/users`).doc(local_uid).get()).exists;

        if(post_liked && user_exists || !post_liked && !user_exists || !post_exists) {
            res.status(400).send({ message: 'Operation not allowed.', warning: true });
            return
        };

        if(post_liked && !user_exists) {

            const { username, profile_image, uid } = await getFirestore().collection('users').doc(local_uid)
                .get().then(doc => doc.data())
                .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            await liked_post.set({ post_id_ref: post_id, user_uids: FieldValue.arrayUnion(local_uid)}, { merge: true })
                .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            await liked_post.collection('users').doc(local_uid).create({ 
                liked_at: Timestamp.now().seconds,
                owner: {
                    uid,
                    username, 
                    profile_image,
                },
            }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            await post.set({ total_likes: FieldValue.increment(1) }, { merge: true })
                .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            res.status(200).send({ message: 'Post liked!' });
            return;
        } 
        
        if(!post_liked && user_exists) {

            await liked_post.set({ 
                user_uids: FieldValue.arrayRemove(local_uid),
            }, { merge: true})
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            await liked_post.collection('users').doc(local_uid).delete()
                .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

            await post.set({ total_likes: FieldValue.increment(-1) }, { merge: true })
                .catch(() => { throw Error('There was an error deleting your post. Please try again.') });
            
            res.status(200).send({ message: 'Post unliked!' });
            return;
        }

    } catch(error) {
        res.status(500).send(error);
    };
};