const { getFirestore, Timestamp } = require('../../modules');

exports.createPost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { text } = req.body;

    try {

        const post_id = getFirestore().collection('posts').doc().id;
        const { username, occupation, profile_image } = (await getFirestore().collection('users').doc(local_uid).get()).data();

        const post = {
            post_id,
            created_at: Timestamp.now().seconds,
            text,
            total_likes: 0,
            total_comments: 0,
            owner: { uid: local_uid, username, profile_image, occupation }
        };

        await getFirestore().collection('posts')
            .doc(post_id).create(post)
            .catch(() => { throw Error('There was an error creating your post. Please try again.') });

        res.status(200).send({ message: 'Post created!', post });
            
    } catch(error) {
        res.status(500).send(error)
    };
};

exports.updatePost = async (req, res) => {
    const { text, post_id } = req.body;

    try {

        await getFirestore().collection('posts')
            .doc(post_id).set({ text, post_edited: true }, { merge: true })
            .catch(() => { throw Error('There was an error updating your post. Please try again.') });

        res.status(200).send({ message: 'Post updated!', text, post_edited: true });
            
    } catch(error) {
        res.status(500).send(error);
    };
};

exports.deletePost = async (req, res) => {
    const { post_id } = req.body;

    try {

        const post = getFirestore().collection('posts').doc(post_id);
        const post_comments = getFirestore().collection('comments')
            .where('post_id_ref', '==', post_id);
        const post_likes = getFirestore().collection('post_likes')
            .where('post_id_ref', '==', post_id);

        const batch = getFirestore().batch();

        batch.delete(post);

        await post_comments.get().then(snapshot => {
            snapshot.forEach(doc => {
                batch.delete(doc.ref)
            })
        })
        
        await post_likes.get().then(snapshot => {
            snapshot.forEach(doc => {
                batch.delete(doc.ref)
            })
        })

        await batch.commit()
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        res.status(200).send({ message: 'Post deleted!' });
            
    } catch(error) {
        res.status(500).send(error);
    };
};