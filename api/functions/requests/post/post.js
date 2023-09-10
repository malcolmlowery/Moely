const { getFirestore, Timestamp, FieldValue } = require('../../modules');
const axios = require('axios');
const FormData = require('form-data');

exports.createPost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { text, linkUrlText } = req.body.post_data;
    
    try {

        if(linkUrlText) {
            let data = new FormData();
            data.append('text', linkUrlText);
            data.append('lang', 'en');
            data.append('mode', 'rules');
            data.append('api_user', '1653929465');
            data.append('api_secret', '5wjNxqaScPYszagK258u');

            const link_received = await axios({
                url: 'https://api.sightengine.com/1.0/text/check.json',
                method:'post',
                data: data,
                headers: data.getHeaders()
            })
            .then((response) => response.data);

            const link_exists = link_received.link.matches;

            if(link_exists.length === 0) {
                res.status(403).send({ warning: true, message: 'Please enter a valid URL.' })
                return;
            };
            if(link_exists[0].category === 'adult') {
                res.status(403).send({ warning: true, message: 'The link your provided is not allowed...' })
                return;
            };
        };
        
        const post_id = getFirestore().collection('posts').doc().id;
        const { username, occupation, profile_image } = (await getFirestore().collection('users').doc(local_uid).get()).data();

        const post = {
            post_id,
            created_at: Timestamp.now().seconds,
            text,
            has_url_link: linkUrlText ? true : false,
            url_link: linkUrlText,
            total_likes: 0,
            total_comments: 0,
            owner: { uid: local_uid, username, profile_image, occupation }
        };

        await getFirestore().collection('posts')
            .doc(post_id).create(post)
            .catch(() => { throw Error('There was an error creating your post. Please try again.') });

        res.status(200).send({ message: 'Post created!', post: { ...post, is_post_owner: true } });
            
    } catch(error) {
        res.status(500).send(error)
    };
};

exports.updatePost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { post_id, text, url_link } = req.body.post_data;

    try {

        if(url_link) {
            let data = new FormData();
            data.append('text', url_link);
            data.append('lang', 'en');
            data.append('mode', 'rules');
            data.append('api_user', '1653929465');
            data.append('api_secret', '5wjNxqaScPYszagK258u');

            const link_received = await axios({
                url: 'https://api.sightengine.com/1.0/text/check.json',
                method:'post',
                data: data,
                headers: data.getHeaders()
            })
            .then((response) => response.data);

            const link_exists = link_received.link.matches;

            if(link_exists.length === 0) {
                res.status(403).send({ warning: true, message: 'Please enter a valid URL.' })
                return;
            };
            if(link_exists[0].category === 'adult') {
                res.status(403).send({ warning: true, message: 'The link your provided is not allowed...' })
                return;
            };
        };

        const post = getFirestore().collection('posts').doc(post_id)
        const post_exists = (await post.get()).exists;

        if(!post_exists) {
            res.status(200).send({ message: 'Operation not allowed', warning: true });
            return;
        };

        const batch = getFirestore().batch();

        batch.set(post, { text, url_link, has_url_link: url_link ? true : false, post_edited: true }, { merge: true })

        await getFirestore().collectionGroup('notification')
            .where('content.ref_id', '==', post_id)
            .where('notification_owner_uid', '==', local_uid)
            .where('notification_type', 'in', ['post_liked', 'new_comment'])
            .get().then(snapshot => {
                if(snapshot.empty) return;
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { 
                        content: { text },
                    }, { merge: true });
                });
            }).catch(() => { throw Error('There was an error updating your post. Please try again.') });

        await batch.commit()
            .catch(() => { throw Error('There was an error updating your post. Please try again.') });

        res.status(200).send({ 
            message: 'Post updated!', 
            text, 
            post_edited: true, 
            has_url_link: url_link ? true : false,
            url_link: url_link ? url_link : null,
            uid: local_uid 
        });
            
    } catch(error) {
        res.status(500).send(error);
    };
};

exports.deletePost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { post_id } = req.body;

    try {
        const post = getFirestore().collection('posts').doc(post_id);
        const hidden_post = getFirestore().collection('hidden_posts').doc(post_id);
        const reported_post = getFirestore().collection('reported_posts').doc(post_id);
        const liked_post = getFirestore().collection('liked_posts').doc(post_id);
        const post_comments = getFirestore().collection('comments').doc(post_id);
        const liked_comments_of_post = getFirestore().collection(`comments/${post_id}/liked_comments`);
        const reported_comments_of_post = getFirestore().collection(`comments/${post_id}/reported_comments`);
        const notification_root_doc = getFirestore().collection('notifications').doc(local_uid);
        const notifications = getFirestore().collection(`notifications/${local_uid}/notification`)
            .where('content.ref_id', '==', post_id);
        const post_in_user_activities = getFirestore().collectionGroup('activities')
            .where('post_id_ref', '==', post_id).where('content_owner_uid', '==', local_uid);

        const total_post_new_notifications = await notifications.where('has_new_activity', '==', true)
            .count().get().then(value => value.data().count)
            .catch(error => console.log(error));

        const batch = getFirestore().batch();

        await liked_comments_of_post.get()
            .then(snapshot => snapshot.forEach(doc => batch.delete(doc.ref) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        await reported_comments_of_post.get()
            .then(snapshot => snapshot.forEach(doc => batch.delete(doc.ref) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        await post_comments.collection('users').get()
            .then(snapshot => snapshot.forEach(doc => batch.delete(doc.ref) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        await liked_post.collection('users').get()
            .then(snapshot => snapshot.forEach(doc => batch.delete(doc.ref) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        await post_in_user_activities.get()
            .then(snapshot => snapshot.forEach(doc => batch.set(doc.ref, { content_deleted: true }, { merge: true }) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        await notifications.get()
            .then(snapshot => snapshot.forEach(doc => batch.delete(doc.ref) ))
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        batch.set(notification_root_doc, { total_notifications: FieldValue.increment(-total_post_new_notifications) }, { merge: true });
        batch.delete(post_comments);
        batch.delete(post);
        batch.delete(hidden_post);
        batch.delete(liked_post);
        batch.delete(reported_post);

        await batch.commit()
            .catch(() => { throw Error('There was an error deleting your post. Please try again.') });

        res.status(200).send({ message: 'Post deleted!', uid: local_uid });
            
    } catch(error) {
        res.status(500).send(error);
    };
};

exports.getPost = async (req, res) => {
    const local_uid = res.locals.uid;
    const { post_id, notification_action } = req.query;

    try {
        const liked_posts = [];

        const post = getFirestore().collection('posts').doc(post_id);
        const post_exists = (await post.get()).exists;

        if(!post_exists) {
            res.status(200).send({ message: 'This post no longer exists', warning: true });
            return;
        };

        if(notification_action) {
            await getFirestore().collection(`notifications/${local_uid}/notification`)
                .where('content.ref_id', '==', post_id)
                .where('notification_type', '==', notification_action)
                .get().then(async (snapshot) => {
                    const doc = snapshot.docs[snapshot.docs.length - 1].ref;
                    if(snapshot.docs[snapshot.docs.length - 1].data().has_new_activity === true) {
                        await getFirestore().collection('notifications').doc(local_uid)
                            .set({ total_notifications: FieldValue.increment(-1) }, { merge: true});
                    }
                    await doc.set({ has_new_activity: false }, { merge: true });
                });
        };

        await getFirestore().collection('liked_posts')
            .where('post_id_ref', '==', post_id)
            .where('user_uids', 'array-contains', local_uid)
            .get().then(snapshot => {
                snapshot.forEach(doc => liked_posts.push(doc.data().post_id_ref));
            });
            
        await post.get().then(doc => {
            res.status(200).send({ 
                ...doc.data(), 
                is_post_owner: doc.data().owner.uid === local_uid ? true : false,
                post_liked: liked_posts.length === 0 ? false : true 
            });
        }).catch(() => { throw Error('There was an error creating your profile. Please try again.') });

    } catch(error) {
        res.status(500).send(error);
    };
};