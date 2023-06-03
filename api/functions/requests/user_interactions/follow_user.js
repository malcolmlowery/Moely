const { getFirestore, Timestamp, FieldValue } = require('../../modules');

exports.followUser = async (req, res) => {
    const local_uid = res.locals.uid;
    const { profile_uid } = req.body;

    try {

        const { username, profile_image, occupation } = await getFirestore().collection('users').doc(local_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        const user_profile = await getFirestore().collection('users').doc(profile_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        const followers_collection_doc = getFirestore().collection('followers').doc(profile_uid);
        const user_in_users_collection = followers_collection_doc.collection('users').doc(local_uid);

        const user_exists = (await user_in_users_collection.get()).exists;

        if(user_exists) {
            await followers_collection_doc.set({ user_uids: FieldValue.arrayRemove(local_uid), total_followers: FieldValue.increment(-1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });
        
            await followers_collection_doc.collection('users').doc(local_uid)
                .delete().catch(() => { throw Error('An internal error occurred. Please try again') });

            res.status(200).send({ message: 'User unfollowed.', following_user: false })
        };

        if(!user_exists) {
            await followers_collection_doc.set({ user_uids: FieldValue.arrayUnion(local_uid), total_followers: FieldValue.increment(1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });
        
            await followers_collection_doc.collection('users').doc(local_uid)
                .create({ 
                    followed_on: Timestamp.now().seconds, 
                    owner: { uid: local_uid, username, profile_image, occupation }
                }).catch(() => { throw Error('An internal error occurred. Please try again') });
            
            res.status(200).send({ message: `You are now following ${user_profile.username}`, following_user: true })
        }

    } catch(error) {
        res.status(500).send(error)
    }
};