const { getFirestore, FieldValue } = require('../../modules');

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
        uid,
        text,
    } = args;
    
    const user_activity_history_root_doc = getFirestore().collection('activity_history').doc(local_uid);
    const activites_collection = getFirestore().collection(`activity_history/${local_uid}/activities`);

    if(type === 'following') {
        const activity_doc = activites_collection.where('type', '==', 'following').where('uid', '==', profile_uid);
        const doc_empty = await activity_doc.get().then(snapshot => snapshot.empty);
        
        if(doc_empty) {
            await activites_collection.doc().create({
                type: 'following',
                timestamp,
                uid: profile_uid,
                username,
                profile_image,
                occupation,
            }).catch(() => { throw Error('An internal error occurred. Please try again') });
            
            await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };

        if(!doc_empty) {
            await activity_doc.get().then(snapshot => {
                const doc = snapshot.docs[snapshot.docs.length -1].ref
                batch.delete(doc)
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(-1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });
            return;
        };
    };

    if(type === 'like') {
        const activity_doc = activites_collection.where('type', '==', 'like').where('post_id', '==', post_id);
        const doc_empty = await activity_doc.get().then(snapshot => snapshot.empty);

        if(doc_empty) {
            await activites_collection.doc().create({
                type: 'like',
                timestamp,
                uid,
                username,
                profile_image,
                occupation,
                post_id,
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };

        if(!doc_empty) {
            await activity_doc.get().then(async (snapshot) => {
                await snapshot.docs[snapshot.docs.length -1].ref.delete()
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(-1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });
            return;
        };
    };

    if(type === 'comment') {
        const activity_doc = activites_collection.where('post_id', '==', post_id).where('comment_id', '==', comment_id).where('type', '==', 'comment');
        const doc_empty = await activity_doc.get().then(snapshot => snapshot.empty);
        
        if(doc_empty) {
            await activites_collection.doc().create({
                type: 'comment',
                comment_id,
                post_id,
                uid,
                username,
                profile_image,
                occupation,
                text,
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };

        if(!doc_empty) {
            await activity_doc.get().then(async (snapshot) => {
                await snapshot.docs[snapshot.docs.length - 1].ref.delete();
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(-1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };
    };

    if(type === 'comment_like') {
        const activity_doc = activites_collection.where('post_id', '==', post_id).where('comment_id', '==', comment_id).where('type', '==', 'comment_like');
        const doc_empty = await activity_doc.get().then(snapshot => snapshot.empty);
        
        if(doc_empty) {
            await activites_collection.doc().create({
                type: 'comment_like',
                comment_id,
                post_id,
                uid,
                username,
                profile_image,
                occupation,
                text,
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };

        if(!doc_empty) {
            await activity_doc.get().then(async (snapshot) => {
                await snapshot.docs[snapshot.docs.length - 1].ref.delete();
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            await user_activity_history_root_doc.set({ total_user_activities: FieldValue.increment(-1) }, { merge: true })
                .catch(() => { throw Error('An internal error occurred. Please try again') });

            return;
        };
    };
};