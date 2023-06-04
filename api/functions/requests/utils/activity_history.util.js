const { getFirestore, Timestamp, FieldValue } = require('../../modules');

exports.userActivityHistory = async (args) => {
    
    const {
        batch,
        type,
        local_uid,
        username,
        occupation,
        profile_uid,
        profile_image,
        timestamp,
        post_id,
        comment_id,
    } = args;
    
    const user_activity_history_root_doc = getFirestore().collection('activity_history').doc(local_uid);
    const user_activity_history_sub_doc = user_activity_history_root_doc.collection('activities');
    const user_activity_history_root_doc_exists = (await user_activity_history_root_doc.get()).exists;

    if(user_activity_history_root_doc_exists) {

        await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(-1) }, { merge: true })
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        if(type === 'following') {
            await user_activity_history_sub_doc
                .where('type', '==', 'following')
                .where('uid', '==', profile_uid)
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                }).catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };

        if(type === 'like') {
            await user_activity_history_sub_doc
                .where('type', '==', 'like')
                .where('post_id', '==', post_id)
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                }).catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };

        if(type === 'comment') {
            await user_activity_history_sub_doc
                .where('post_id', '==', post_id)
                .where('comment_id', '==', comment_id)
                .where('type', '==', 'comment')
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                }).catch(() => { throw Error('An internal error occurred. Please try again') });
            
            return;
        };

        if(type === 'comment_like') {
            await user_activity_history_sub_doc
                .where('post_id', '==', post_id)
                .where('comment_id', '==', comment_id)
                .where('type', '==', 'comment_like')
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                }).catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };
    };
    
    if(!user_activity_history_root_doc_exists) {
        
        await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(1) }, { merge: true })
            .catch(() => { throw Error('An internal error occurred. Please try again') });

        if(type === 'following') {
           
            await user_activity_history_sub_doc.doc().create({
                type: 'following',
                timestamp,
                uid: profile_uid,
                username,
                profile_image,
                occupation,
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };

        if(type === 'like') {
            await user_activity_history_sub_doc
                .where('type', '==', 'like')
                .where('post_id', '==', post_id)
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                }).catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };

        if(type === 'comment') {
            await user_activity_history_sub_doc
                .where('post_id', '==', post_id)
                .where('comment_id', '==', comment_id)
                .where('type', '==', 'comment')
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                }).catch(() => { throw Error('An internal error occurred. Please try again') });
            
            return;
        };

        if(type === 'comment_like') {
            await user_activity_history_sub_doc
                .where('post_id', '==', post_id)
                .where('comment_id', '==', comment_id)
                .where('type', '==', 'comment_like')
                .get().then(snapshot => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref
                    batch.delete(doc)
                }).catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };
    };
};