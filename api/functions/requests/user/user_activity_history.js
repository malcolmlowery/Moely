const { getFirestore } = require('../../modules');

exports.getUserActivityHistory = async (req, res) => {
    const local_uid = res.locals.uid;
    let { last_activity_id } = req.query;
    
    try {
        const user_activities = [];
        const blocked_user_uids = [];

        await getFirestore().collection('blocked_users')
            .doc(local_uid).get().then(doc => {
                if(!doc.exists) return;
                blocked_user_uids.push(...doc.data().user_uids);
            });
            
        await getFirestore().collection('blocked_users')
            .where('user_uids', 'array-contains', local_uid)
            .get().then(snapshot => {
                if(snapshot.empty) return;
                snapshot.forEach(doc => blocked_user_uids.push(doc.id));
            });

        if(!last_activity_id) {

            await getFirestore().collection(`activity_history/${local_uid}/activities`)
                .where('content_deleted', '==', false)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get().then(snapshot => {
                    
                    if(snapshot.empty) {
                        res.status(200).send({ user_activities: [], message: 'There is no history to display just yet!' });
                        return;
                    };
                    
                    last_activity_id = snapshot.docs[snapshot.docs.length - 1].id
                    snapshot.forEach(doc => {
                        const block_user_exists = blocked_user_uids.find((uid) => doc.data().content_owner_uid === uid);
                        if(!block_user_exists) return user_activities.push(doc.data());
                    });

                    res.status(200).send({ user_activities, last_activity_id: snapshot.size >= 3 ? last_activity_id : 'end_of_list' });

                }).catch(() => { throw 'There was an error performing request. Please try again.' });

        } else {
            const last_activity = await getFirestore().collection(`activity_history/${local_uid}/activities`).doc(last_activity_id).get();

            if(!last_activity.exists) {
                res.status(200).send({ user_activities: [], message: 'Operation not allowed' });
                return;
            };

            await getFirestore().collection(`activity_history/${local_uid}/activities`)
                .orderBy('timestamp', 'desc')
                .startAfter(last_activity)
                .limit(12)
                .get().then(snapshot => {
                    
                    if(snapshot.empty) {
                        res.status(200).send({ user_activities: [], last_activity_id: 'end_of_list', message: 'You have reached the end' });
                        return;
                    };
                    
                    last_activity_id = snapshot.docs[snapshot.docs.length - 1].id
                    snapshot.forEach(doc => {
                        const block_user_exists = blocked_user_uids.find((uid) => doc.data().content_owner_uid === uid);
                        if(!block_user_exists) return user_activities.push(doc.data());
                    });

                    res.status(200).send({ user_activities, last_activity_id });

                }).catch(() => { throw 'There was an error performing request. Please try again.' });

        };

    } catch(error) {
        res.status(500).send(error);
    };
};