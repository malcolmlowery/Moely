const { functions, getAuth, getFirestore, Timestamp } = require('../../modules');

exports.createUser = functions.https.onRequest(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user_doc = getFirestore().collection('users').doc();

        await getAuth().createUser({ displayName: username, email, password, uid: user_doc.id })
            .catch((error) => { throw error });

        await user_doc.create({ uid: user_doc.id, username, email, created_at: Timestamp.now().seconds })
            .catch(() => { throw 'There was an error creating your profile. Please try again.' });
            
        res.status(200).send({ message: 'Account created successfully!' });

    } catch(error) {
        res.status(500).send(error);
    };
});

exports.getUserProfile = async (req, res) => {
    const { user_profile_uid } = req.body;

    try {

        const { username, profile_image, cover_photo, location, occupation, bio } = await getFirestore().collection('users').doc(user_profile_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw 'There was an error creating your profile. Please try again.' });

        const user = { username, profile_image, cover_photo, location, occupation, bio };

        res.status(200).send(user);

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.updateUserProfile = async (req, res) => {
    const local_uid = res.locals.uid;
    const { username, email, bio, location, occupation } = req.body;

    const user = getFirestore().collection('users').doc(local_uid);
    const posts = getFirestore().collection('posts')
        .where('owner.uid', '==', local_uid);
    const comments = getFirestore().collection('comments')
        .where('owner.uid', '==', local_uid);
    const post_likes = getFirestore().collection('liked_posts')
        .where('user_uids', 'array-contains', local_uid);

    // Add transaction for updating user data in the notifications collection

    try {
        const user_exists = (await user.get()).exists
        const number_of_posts = await posts.count().get()
            .then(value => value.data().count)
            .catch(error => { throw error });

        const number_of_comments = await comments.count().get()
            .then(value => value.data().count)
            .catch(error => { throw error });

        const number_of_post_likes = await post_likes.get()
            .then(snapshot => snapshot.size)
            .catch(error => { throw error });
            
        const batch = getFirestore().batch();
        
        if(user_exists) {
            batch.set(user, { username, email, bio, location, occupation }, { merge: true });
        }

        if(number_of_posts > 0) {
            await posts.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { username, occupation }}, { merge: true });
                });
            });
        };

        if(number_of_comments > 0) {
            await comments.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { username, occupation }}, { merge: true });
                });
            });
        };

        if(number_of_post_likes > 0) {
            await post_likes.get().then(snapshot => {
                snapshot.forEach(doc => {
                    const doc_ref = doc.ref.collection('users').doc(local_uid);
                    batch.set(doc_ref, { username, occupation }, { merge: true });
                });
            });
        };

        await batch.commit()
            .catch(() => { throw Error('There was an error updating your profile. Please try again.') })

        await getAuth().updateUser(local_uid, { displayName: username, email })
            .catch(error => { throw error });


        res.send({ message: 'Profile updated!' });

    } catch(error) {
        res.status(500).send(error);
    };
};