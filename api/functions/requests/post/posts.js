const { getFirestore } = require('../../modules');

exports.getNewsfeedPosts = async (req, res) => {
    const local_uid = res.locals.uid;
    let { last_post_id } = req.query;
    console.log(last_post_id)

    if(last_post_id === 'end_of_list') {
        res.status(200).send({ posts: [], last_post_id: 'end_of_list', message: 'Operation not allowed'});
        return;
    };

    try {
        const posts = [];
        const liked_posts = [];
        const hidden_posts = [];
        const reported_posts = [];

        await getFirestore().collection('liked_posts')
            .where('user_uids', 'array-contains', local_uid)
            .get().then(snapshot => {
                snapshot.forEach(doc => liked_posts.push(doc.data().post_id_ref));
            });

        await getFirestore().collection('hidden_posts')
            .where('user_uids', 'array-contains', local_uid)
            .get().then(snapshot => {
                snapshot.forEach(doc => hidden_posts.push(doc.data().post_id_ref));
            });
        
        await getFirestore().collection('reported_posts')
            .where('user_uids', 'array-contains', local_uid)
            .get().then(snapshot => {
                snapshot.forEach(doc => hidden_posts.push(doc.data().post_id_ref));
            });

        await getFirestore().collection('posts')
            .where('flagged_post', '==', true)
            .get().then(snapshot => {
                snapshot.forEach(doc => hidden_posts.push(doc.data().post_id));
            });

        if(!last_post_id) {
            let post_query = getFirestore().collection('posts')
                
            hidden_posts.length > 0 ? post_query = post_query.where('post_id', 'not-in', hidden_posts) : undefined;
            // reported_posts.length > 0 ? post_query = post_query.where('post_id', 'not-in', reported_posts) : undefined;

            await post_query
                .orderBy('created_at', 'desc')
                .limit(3)
                .get().then(snapshot => {

                    if(snapshot.empty) {
                        res.status(200).send({ posts: [], message: 'No posts to display just yet!' });
                        return;
                    };
                    
                    snapshot.forEach(doc => {
                        const liked_post_exists = liked_posts.find((post_id) => doc.data().post_id === post_id);

                        if(liked_post_exists) {
                            posts.push({ 
                                ...doc.data(), 
                                post_liked: true, 
                                is_post_owner: doc.data().owner.uid === local_uid ? true : false
                            });
                        } else {
                            posts.push({ 
                                ...doc.data(), 
                                post_liked: false, 
                                is_post_owner: doc.data().owner.uid === local_uid ? true : false
                            });
                        };
                    });
                    console.log(posts)
                    res.status(200).send({ posts, last_post_id: snapshot.size >= 3 ? posts[posts.length - 1].post_id : 'end_of_list' });
                });

        } else {
            const last_post = await getFirestore().collection('posts').doc(last_post_id).get();

            if(!last_post.exists) {
                res.status(200).send({ posts: [], message: 'Operation not allowed'});
                return;
            };

            let post_query = getFirestore().collection('posts')
                
            hidden_posts.length > 0 ? post_query = post_query.where('post_id', 'not-in', hidden_posts) : undefined;
            // reported_posts.length > 0 ? post_query = post_query.where('post_id', 'not-in', reported_posts) : undefined;
        
            await post_query
                .orderBy('created_at', 'desc')
                .startAfter(last_post)
                .limit(3)
                .get().then(snapshot => {
                    
                    if(snapshot.empty) {
                        res.status(200).send({ posts: [], last_post_id: 'end_of_list', message: 'You have reached the end' });
                        return;
                    };

                    snapshot.forEach(doc => {
                        const liked_post_exists = liked_posts.find((post_id) => doc.data().post_id === post_id);

                        if(liked_post_exists) {
                            posts.push({ 
                                ...doc.data(), 
                                post_liked: true, 
                                is_post_owner: doc.data().owner.uid === local_uid ? true : false
                            });
                        } else {
                            posts.push({ 
                                ...doc.data(), 
                                post_liked: false, 
                                is_post_owner: doc.data().owner.uid === local_uid ? true : false
                            });
                        };
                    });
                    
                    res.status(200).send({ posts, last_post_id: posts[posts.length - 1].post_id });
                });

        };

    } catch(error) {
        res.status(500).send({ error })
    };
};