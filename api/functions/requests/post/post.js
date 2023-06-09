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
        const hidden_post = getFirestore().collection('hidden_posts').doc(post_id);
        const reported_post = getFirestore().collection('reported_posts').doc(post_id);
        const liked_post = getFirestore().collection('liked_posts').doc(post_id);
        const post_comments = getFirestore().collection('comments').doc(post_id);
        const liked_comments_of_post = getFirestore().collection(`comments/${post_id}/liked_comments`);
        const reported_comments_of_post = getFirestore().collection(`comments/${post_id}/reported_comments`);
        // const post_in_user_activities = getFirestore().collectionGroup('activities')
        //     .where('post_id', '==', post_id);

        const batch = getFirestore().batch();

        await liked_comments_of_post.get()
            .then(snapshot => snapshot.forEach(doc => batch.delete(doc.ref) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        await reported_comments_of_post.get()
            .then(snapshot => snapshot.forEach(doc => batch.delete(doc.ref) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        await post_comments.collection('users').get()
            .then(snapshot => snapshot.forEach(doc => batch.delete(doc.ref) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        await liked_post.collection('users').get()
            .then(snapshot => snapshot.forEach(doc => batch.delete(doc.ref) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        batch.delete(post_comments);
        batch.delete(post);
        batch.delete(hidden_post);
        batch.delete(liked_post);
        batch.delete(reported_post);

        await batch.commit()
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        res.status(200).send({ message: 'Post deleted!' });
            
    } catch(error) {
        res.status(500).send(error);
    };
};

exports.getPost = async (req, res) => {
    const { post_id } = req.body;

    try {

        const post = await getFirestore().collection('posts').doc(post_id)
            .get().then(doc => doc.data())
            .catch(() => { throw 'There was an error creating your profile. Please try again.' });

        res.status(200).send(post);

    } catch(error) {
        res.status(500).send(error);
    };
};