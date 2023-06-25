const { getFirestore } = require('../../modules');

exports.getPostComments = async (req, res) => {
    const local_uid = res.locals.uid;
    let { post_id, last_comment_id } = req.query;

    try {
        const comments = [];
        const liked_comments = [];
        const hidden_comments = [];
        const reported_comments = [];

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
                snapshot.forEach(doc => reported_posts.push(doc.id));
            });

        if(!last_comment_id) {
            let comment_query = getFirestore().collection(`comments/${post_id}/users`)
                
            hidden_comments.length > 0 ? comment_query = comment_query.where('comment_id', 'not-in', hidden_comments) : undefined;
            reported_comments.length > 0 ? comment_query = comment_query.where('user_uids', 'not-in', reported_comments) : undefined;
                
            await comment_query.orderBy('created_at', 'desc').limit(3)
                .get().then(snapshot => {
                    if(snapshot.empty) {
                        res.status(200).send({ comments: [], message: 'No comments to display just yet!' });
                        return;
                    };

                    snapshot.forEach(doc => {
                        if(liked_comments.length > 0) {
                            liked_comments.map(comment_id_ref => {
                                if(comment_id_ref === doc.data().comment_id) {
                                    comments.push({ ...doc.data(), comment_liked: true });
                                } else {
                                    comments.push(doc.data());
                                };
                            });
                        } else {
                            comments.push(doc.data());
                        };
                    });

                    res.status(200).send({ comments, last_comment_id: snapshot.size === 3 ? comments[comments.length - 1].comment_id : undefined });
                });

        } else {
            const last_comment = await getFirestore().collection(`comments/${post_id}/users`).doc(last_comment_id).get();

            if(!last_comment.exists) {
                res.status(200).send({ comment_query: [], message: 'Operation not allowed'});
                return;
            };

            let comment_query = getFirestore().collection(`comments/${post_id}/users`)
                
            hidden_comments.length > 0 ? comment_query = comment_query.where('comment_id', 'not-in', hidden_comments) : undefined;
            reported_comments.length > 0 ? comment_query = comment_query.where('user_uids', 'not-in', reported_comments) : undefined;
                
            await comment_query
                .orderBy('created_at', 'desc')
                .startAfter(last_comment)
                .limit(3)
                .get().then(snapshot => {
                    
                    if(snapshot.empty) {
                        res.status(200).send({ comments: [], message: 'You have reached the end' });
                        return;
                    };

                    snapshot.forEach(doc => {
                        if(liked_comments.length > 0) {
                            liked_comments.map(comment_id_ref => {
                                if(comment_id_ref === doc.data().comment_id) {
                                    comments.push({ ...doc.data(), comment_liked: true });
                                } else {
                                    comments.push(doc.data());
                                };
                            });
                        } else {
                            comments.push(doc.data());
                        };
                    });

                    res.status(200).send({ comments, last_comment_id: snapshot.size === 3 ? comments[comments.length - 1].comment_id : undefined });
                });

        };

    } catch(error) {
        res.status(500).send({ error })
    };
};