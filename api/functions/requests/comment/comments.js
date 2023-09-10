const { getFirestore } = require('../../modules');

exports.getPostComments = async (req, res) => {
    const local_uid = res.locals.uid;
    let { post_id, last_comment_id } = req.query;
    
    if(last_comment_id === 'end_of_list') {
        res.status(200).send({ comments: [], last_comment_id: 'end_of_list', message: 'Operation not allowed' });
        return;
    };

    try {
        const comments = [];
        const liked_comments = [];
        const hidden_comments = [];
        const reported_comments = [];
        const blocked_user_uids = [];

        await getFirestore().collection(`comments/${post_id}/liked_comments`)
            .where('owner.uid', '==', local_uid)
            .get().then(snapshot => {
                snapshot.forEach(doc => liked_comments.push(doc.data().comment_id_ref));
            });

        await getFirestore().collection(`comments/${post_id}/hidden_comments`)
            .where('user_uids', 'array-contains', local_uid)
            .get().then(snapshot => {
                snapshot.forEach(doc => hidden_comments.push(doc.id));
            });
        
        await getFirestore().collection(`comments/${post_id}/reported_posts`)
            .where('user_uids', 'array-contains', local_uid)
            .get().then(snapshot => {
                snapshot.forEach(doc => hidden_comments.push(doc.id));
            });

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

        if(!last_comment_id) {

            await getFirestore().collection(`comments/${post_id}/users`)
                .orderBy('created_at', 'desc').limit(15)
                .get().then(snapshot => {

                    if(snapshot.empty) {
                        res.status(200).send({ comments: [], last_comment_id: 'end_of_list', message: 'You have reached the end' });
                        return;
                    };

                    snapshot.forEach(doc => {
                        const block_user_exists = blocked_user_uids.find((uid) => {
                            if(doc.data().owner.uid === uid && doc.data().owner.uid !== local_uid) return uid;
                        });
                        const hidden_comment_exists = hidden_comments.find((comment_id) => doc.data().comment_id === comment_id);
                        const liked_comment_exists = liked_comments.find((comment_id) => doc.data().comment_id === comment_id);

                        if(!hidden_comment_exists && !block_user_exists) {
                            if(liked_comment_exists) {
                                comments.push({ 
                                    ...doc.data(), 
                                    comment_liked: true,
                                    is_comment_owner: doc.data().owner.uid === local_uid ? true : false
                                });
                            } else {
                                comments.push({
                                    ...doc.data(), 
                                    comment_liked: false,
                                    is_comment_owner: doc.data().owner.uid === local_uid ? true : false
                                });
                            };
                        };
                    });

                    res.status(200).send({ comments, last_comment_id: snapshot.size >= 3 ? comments[comments.length - 1].comment_id : 'end_of_list' });
                });

        } else {

            const last_comment = await getFirestore().collection(`comments/${post_id}/users`).doc(last_comment_id).get();

            if(!last_comment.exists) {
                res.status(200).send({ comments: [], message: 'Operation not allowed' });
                return;
            };

            await getFirestore().collection(`comments/${post_id}/users`)
                .orderBy('created_at', 'desc').startAfter(last_comment).limit(15)
                .get().then(snapshot => {
                    
                    if(snapshot.empty) {
                        res.status(200).send({ comments: [], last_comment_id: 'end_of_list', message: 'You have reached the end' });
                        return;
                    };

                    snapshot.forEach(doc => {
                        const block_user_exists = blocked_user_uids.find((uid) => {
                            if(doc.data().owner.uid === uid && doc.data().owner.uid !== local_uid) return uid;
                        });
                        const hidden_comment_exists = hidden_comments.find((comment_id) => doc.data().comment_id === comment_id);
                        const liked_comment_exists = liked_comments.find((comment_id) => doc.data().comment_id === comment_id);

                        if(!hidden_comment_exists && !block_user_exists) {
                            if(liked_comment_exists) {
                                comments.push({ 
                                    ...doc.data(), 
                                    comment_liked: true,
                                    is_comment_owner: doc.data().owner.uid === local_uid ? true : false
                                });
                            } else {
                                comments.push({
                                    ...doc.data(), 
                                    comment_liked: false,
                                    is_comment_owner: doc.data().owner.uid === local_uid ? true : false
                                });
                            };
                        };
                    });

                    res.status(200).send({ comments, last_comment_id: comments[comments.length - 1].comment_id });
                });

        };

    } catch(error) {
        res.status(500).send({ error })
    };
};