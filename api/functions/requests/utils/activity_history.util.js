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
        other_user_uid,
        timestamp,
        post_id,
        comment_id,
        uid,
        text,
    } = args;
    
    const user_activity_history_root_doc = getFirestore().collection('activity_history').doc(local_uid);
    const activites_collection = getFirestore().collection(`activity_history/${local_uid}/activities`);
    const new_activites_collection_doc = activites_collection.doc();

    if(type === 'following') {
        const activity_doc = activites_collection.where('type', '==', 'following').where('uid', '==', profile_uid);
        const doc_empty = await activity_doc.get().then(snapshot => snapshot.empty);
        
        if(doc_empty) {
            batch.create(new_activites_collection_doc, {
                type: 'following',
                timestamp,
                uid: profile_uid,
                username,
                profile_image,
                occupation,
                content_deleted: false,
            });
            
            batch.set(user_activity_history_root_doc, { total_user_activities: FieldValue.increment(1) }, { merge: true });
            return;
        };

        if(!doc_empty) {
            await activity_doc.get().then(snapshot => {
                const doc = snapshot.docs[snapshot.docs.length -1].ref
                batch.delete(doc)
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            batch.set(user_activity_history_root_doc, { total_user_activities: FieldValue.increment(-1) }, { merge: true })
            return;
        };
    };

    if(type === 'like') {
        const activity_doc = activites_collection.where('post_id_ref', '==', post_id).where('content_owner_uid', '==', other_user_uid).where('type', '==', 'like');
        const doc_empty = await activity_doc.get().then(snapshot => snapshot.empty);
        
        if(doc_empty) {
            batch.set(user_activity_history_root_doc, { total_user_activities: FieldValue.increment(1) }, { merge: true });
            batch.create(new_activites_collection_doc, {
                type: 'like',
                timestamp,
                content_owner_uid: other_user_uid,
                post_id_ref: post_id,
                username,
                profile_image,
                occupation,
                text,
                content_deleted: false,
            });

            return;
        };

        if(!doc_empty) {
            await activity_doc.get().then(snapshot => {
                const doc = snapshot.docs[snapshot.docs.length -1].ref;
                batch.delete(doc);
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            batch.set(user_activity_history_root_doc, { total_user_activities: FieldValue.increment(-1) }, { merge: true });

            return;
        };
    };

    if(type === 'comment') {
        const activity_doc = activites_collection.where('comment_id', '==', comment_id).where('post_id_ref', '==', post_id).where('content_owner_uid', '==', other_user_uid).where('type', '==', 'comment');
        const doc_empty = await activity_doc.get().then(snapshot => snapshot.empty);
        
        if(doc_empty) {
            batch.create(new_activites_collection_doc, {
                type: 'comment',
                timestamp,
                comment_id,
                content_owner_uid: other_user_uid,
                post_id_ref: post_id,
                username,
                profile_image,
                occupation,
                text,
                content_deleted: false,
            });

            batch.set(user_activity_history_root_doc, { total_user_activities: FieldValue.increment(1) }, { merge: true });
            return;
        };

        if(!doc_empty) {
            await getFirestore().collectionGroup('activities')
                .where('post_id_ref', '==', post_id)
                .where('comment_id', '==', comment_id)
                .get().then(snapshot => {
                    if(snapshot.empty) return;
                    snapshot.forEach(doc => {
                        batch.set(doc.ref, { content_deleted: true }, { merge: true })
                    });
                });
                
            return;
        };
    };

    if(type === 'comment_like') {
        const activity_doc = activites_collection.where('post_id_ref', '==', post_id).where('comment_id', '==', comment_id).where('type', '==', 'comment_like');
        const doc_empty = await activity_doc.get().then(snapshot => snapshot.empty);
        
        if(doc_empty) {
            batch.create(new_activites_collection_doc, {
                type: 'comment_like',
                comment_id,
                content_owner_uid: other_user_uid,
                post_id_ref: post_id,
                username,
                timestamp,
                profile_image,
                occupation,
                text,
                content_deleted: false,
            });

            batch.set(user_activity_history_root_doc, { total_user_activities: FieldValue.increment(1) }, { merge: true })
            return;
        };

        if(!doc_empty) {
            await activity_doc.get().then(async (snapshot) => {
                const doc = snapshot.docs[snapshot.docs.length - 1].ref;
                batch.delete(doc);
            }).catch(() => { throw Error('An internal error occurred. Please try again') });

            batch.set(user_activity_history_root_doc, { total_user_activities: FieldValue.increment(-1) }, { merge: true });
            return;
        };
    };
};