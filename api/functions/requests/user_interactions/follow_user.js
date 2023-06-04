const { getFirestore, Timestamp, FieldValue } = require('../../modules');

exports.followUser = async (req, res) => {
    const local_uid = res.locals.uid;
    const { profile_uid } = req.body;

    try {

        const local_user = getFirestore().collection('users').doc(local_uid)

        const { username, profile_image, occupation } = await local_user.get()
            .then(doc => doc.data())
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        const user_profile = await getFirestore().collection('users').doc(profile_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        const followers_collection_doc = getFirestore().collection('followers').doc(profile_uid);
        const user_in_users_collection = followers_collection_doc.collection('users')
            .where('owner.uid', '==', local_uid);

        const following_collection_doc = getFirestore().collection('following').doc(local_uid);

        const user_doc_empty = await user_in_users_collection.get()
            .then(snapshot => snapshot.empty);

        if(!user_doc_empty) {
            const batch = getFirestore().batch();
            
            batch.set(followers_collection_doc, { user_uids: FieldValue.arrayRemove(local_uid), total_followers: FieldValue.increment(-1) }, { merge: true });
        
            await followers_collection_doc.collection('users')
                .where('owner.uid', '==', local_uid)
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                });
                
            batch.set(following_collection_doc, { user_uids: FieldValue.arrayRemove(profile_uid), total_following: FieldValue.increment(-1) }, { merge: true });

            await following_collection_doc.collection('users')
                .where('owner.uid', '==', profile_uid)
                .get().then(snapshot => {
                    console.log(3)
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                });

            // batch.set(local_user, { following_users_uids: FieldValue.arrayRemove(profile_uid) }, { merge: true });

            await batch.commit()
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            res.status(200).send({ message: 'User unfollowed.', following_user: false });
        };

        if(user_doc_empty) {
            await followers_collection_doc.set({ user_uids: FieldValue.arrayUnion(local_uid), total_followers: FieldValue.increment(1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });
        
            await followers_collection_doc.collection('users').doc()
                .create({ 
                    followed_on: Timestamp.now().seconds, 
                    owner: { uid: local_uid, username, profile_image, occupation }
                }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await following_collection_doc.set({ user_uids: FieldValue.arrayUnion(profile_uid), total_following: FieldValue.increment(1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            await following_collection_doc.collection('users').doc()
                .create({ 
                    started_following_on: Timestamp.now().seconds, 
                    owner: { uid: profile_uid, username: user_profile.username, profile_image: user_profile.profile_image, occupation: user_profile.occupation }
                }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await local_user.set({ following_users_uids: FieldValue.arrayUnion(profile_uid) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });
            
            res.status(200).send({ message: `You are now following ${user_profile.username}`, following_user: true })
        }

    } catch(error) {
        res.status(500).send(error)
    }
};