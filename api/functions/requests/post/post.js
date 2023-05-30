const { getFirestore, Timestamp } = require('../../modules');

exports.createPost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { text, uid } = req.body;

    try {

        const post_id = getFirestore().collection('posts').doc().id;
        const { username, occupation, profile_image } = (await getFirestore().collection('users').doc(uid).get()).data()

        const post = {
            post_id,
            created_at: Timestamp.now().seconds,
            text,
            total_likes: 0,
            total_comments: 0,
            owner: { uid, username, profile_image, occupation }
        };

        await getFirestore().collection('posts')
            .doc().create(post)
            .catch(() => { throw Error('There was an error creating your post. Please try again.') })

        res.status(200).send({ message: 'Post created!', post })
            
    } catch(error) {
        res.status(500).send(error)
    }
};