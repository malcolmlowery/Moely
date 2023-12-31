const { getFirestore, Timestamp, FieldValue } = require('../../modules');
const { createNewNotification, deleteNotificationEntry } = require('../notifications/notifications');
const { userActivityHistory } = require('../utils/activity_history.util');
const { Expo } = require('expo-server-sdk');
let expo = new Expo();

exports.followUser = async (req, res) => {
    const local_uid = res.locals.uid;
    const { profile_uid } = req.body;

    try {

        const batch = getFirestore().batch();
        const timestamp = Timestamp.now().seconds;
        const local_user = getFirestore().collection('users').doc(local_uid)

        const { username, profile_image, occupation } = await local_user.get()
            .then(doc => doc.data())
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        const user_profile = await getFirestore().collection('users').doc(profile_uid)
            .get().then(doc => doc.data())
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        // if(!user_profile.exists) {
        //     res.status(400).send({ message: 'Unable to find this users account.', warning: true });
        //     return;
        // };

        const followers_collection_doc = getFirestore().collection('followers').doc(profile_uid);
        const user_in_users_collection = followers_collection_doc.collection('users')
            .where('owner.uid', '==', local_uid);

        const following_collection_doc = getFirestore().collection('following').doc(local_uid);

        const user_doc_empty = await user_in_users_collection.get()
            .then(snapshot => snapshot.empty);

        if(!user_doc_empty) {

            batch.set(followers_collection_doc, { 
                user_uids: FieldValue.arrayRemove(local_uid), 
                total_followers: FieldValue.increment(-1) 
            }, { merge: true });
        
            await followers_collection_doc.collection('users')
                .where('owner.uid', '==', local_uid)
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                }).catch(() => { throw Error('An internal error occurred. Please try again') });
                
            batch.set(following_collection_doc, { 
                user_uids: FieldValue.arrayRemove(profile_uid), 
                total_following: FieldValue.increment(-1) 
            }, { merge: true });

            await following_collection_doc.collection('users')
                .where('owner.uid', '==', profile_uid)
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await userActivityHistory({ batch, local_uid, batch, type: 'following', profile_uid })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            if(profile_uid !== local_uid) {
                await deleteNotificationEntry({ 
                    batch, 
                    local_uid, 
                    notification_type: 'new_follower',
                    notification_owner_uid: profile_uid, 
                    content: { ref_id: local_uid },
                }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });
            };

            await batch.commit()
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            res.status(200).send({ message: 'User unfollowed.', following_user: false, uid: user_profile.uid });
        };

        if(user_doc_empty) {
            const user_in_followers_subcollection = followers_collection_doc.collection('users').doc(local_uid);
            const user_in_followings_subcollection = following_collection_doc.collection('users').doc(profile_uid);
 
            batch.set(followers_collection_doc, { 
                    user_uids: FieldValue.arrayUnion(local_uid), 
                    total_followers: FieldValue.increment(1),
                }, { merge: true })
        
            batch.create(user_in_followers_subcollection, {
                followed_on: timestamp, 
                owner: { uid: local_uid, username, profile_image, occupation } 
            });

            batch.set(following_collection_doc, { 
                user_uids: FieldValue.arrayUnion(profile_uid), total_following: FieldValue.increment(1) 
            }, { merge: true });

            batch.create(user_in_followings_subcollection, { 
                started_following_on: timestamp, 
                owner: { 
                    uid: profile_uid, 
                    username: user_profile.username, 
                    profile_image: user_profile.profile_image, 
                    occupation: user_profile.occupation,
                },
            });

            await userActivityHistory({
                batch,
                local_uid,
                type: 'following',
                timestamp,
                profile_uid: user_profile.uid,
                other_user_uid: user_profile.uid,
                username: user_profile?.username,
                profile_image: user_profile?.profile_image,
                occupation: user_profile?.occupation,
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            if(profile_uid !== local_uid) {
                await createNewNotification({ 
                    batch, 
                    timestamp, 
                    local_uid, 
                    notification_type: 'new_follower',
                    notification_owner_uid: profile_uid, 
                    content: { ref_id: local_uid },
                }).catch(() => { throw Error('There was an error deleting your post. Please try again.') });
            };

            await batch.commit()
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            if(profile_uid !== local_uid) {
                const { push_token } = await getFirestore().collection('users')
                    .doc(user_profile.uid).get().then(doc => doc.data());
            
                const { total_notifications } = await getFirestore().collection('notifications')
                    .doc(user_profile.uid).get().then(doc => doc.data()); 
            
                if(push_token) {
                    await expo.sendPushNotificationsAsync([
                        {
                            to: push_token,
                            title: 'Moely',
                            body: username + ' started following you!',
                            data: { url: `home/profile/${local_uid}`, params: { profile_uid: local_uid, notification_action: 'new_follower' } },
                            badge: total_notifications,
                        },
                    ]);
                };
            };

            res.status(200).send({ message: `You are now following ${user_profile.username}`, following_user: true, uid: user_profile.uid });
        };

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.getFollowers = async (req, res) => {
    const local_uid = res.locals.uid;

    try {
        const follower_uids = [];

        await getFirestore().collection(`followers/${local_uid}/users`)
            .get().then(snapshot => {
                snapshot.forEach(doc => follower_uids.push(doc.data().owner.uid));
            });

        res.status(200).send(follower_uids);

    } catch(error) {
        res.status(500).send(error);
    };
};

exports.getFollowing = async (req, res) => {
    const local_uid = res.locals.uid;

    try {
        const following_uids = [];

        await getFirestore().collection(`following/${local_uid}/users`)
            .get().then(snapshot => {
                snapshot.forEach(doc => following_uids.push(doc.data().owner.uid));
            });
            
        res.status(200).send(following_uids);

    } catch(error) {
        res.status(500).send(error);
    };
};