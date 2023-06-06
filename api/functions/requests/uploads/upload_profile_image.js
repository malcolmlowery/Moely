const { join } = require('path');
const { tmpdir } = require('os');
const { unlink } = require('fs');
const { randomUUID } = require('crypto');
const {
    formidable, 
    sharp, 
    bucket,
    getFirestore,
    getAuth,
    vision,
} = require('../../modules');

const vision_client = new vision.ImageAnnotatorClient({ keyFilename: '/Users/malcolmlowery/Documents/MedRant/api/functions/credentials/fb-service-account.json' });

exports.uploadProfileImage = async (req, res) => {
    const local_uid = res.locals.uid;
    
    try {
        const image_name = randomUUID();
        const form = new formidable.IncomingForm();

        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                const file = files.profile_image;
                
                if(!file) {
                    reject("No file to upload, please choose a image.")
                    return
                };

                const filePath = file.path;
                const tmpFilePath = join(tmpdir(), `${image_name}.jpeg`);

                const [result] = await vision_client.safeSearchDetection(filePath)
                const image_detections = result.safeSearchAnnotation;
                
                if( image_detections.adult === 'LIKELY' || 
                    image_detections.adult === 'POSSIBLE' || 
                    image_detections.adult === 'VERY_LIKELY' ||
                    image_detections.racy === 'VERY_LIKELY' ||
                    image_detections.violence === 'VERY_LIKELY'
                ) {
                    res.status(200).send({ message: 'Please upload a different image.', warning: true });
                    return;
                };
                
                await sharp(filePath)
                    .resize({ height: 200, width: 200 })
                    .toFormat('jpeg', { mozjpeg: true })
                    .toFile(tmpFilePath);

                await bucket.upload(tmpFilePath, { destination: `profile_images/${image_name}.jpeg`});
                await bucket.file(`profile_images/${image_name}.jpeg`).makePublic();
                const image_url = await bucket.file(`profile_images/${image_name}.jpeg`).publicUrl();
          
                await unlink(tmpFilePath, (error) => {
                    if(error) throw error
                });

                const user = getFirestore().collection('users').doc(local_uid);
                const user_in_subcollections = getFirestore().collectionGroup('users')
                    .where('owner.uid', '==', local_uid);
                const user_in_liked_comments_subcollections = getFirestore().collectionGroup('liked_comments')
                    .where('owner.uid', '==', local_uid);
                    const activity_in_user_activity_history_subcollection = getFirestore().collectionGroup('activities')
                        .where('uid', '==', local_uid);
                const posts = getFirestore().collection('posts')
                    .where('owner.uid', '==', local_uid);

                const user_exists = (await user.get()).exists
                
                const number_of_posts = await posts
                    .count().get()
                    .then(value => value.data().count)
                    .catch(error => { throw error });
                
                const user_in_subcollections_count = await user_in_subcollections
                    .count().get()
                    .then(value => value.data().count)
                    .catch(error => { throw error });

                const user_comment_likes_subcollections_count = await user_in_liked_comments_subcollections
                    .count().get()
                    .then(value => value.data().count)
                    .catch(error => { throw error });

                const activity_in_user_activity_history_subcollection_count = await activity_in_user_activity_history_subcollection
                    .count().get()
                    .then(value => value.data().count)
                    .catch(error => { throw error });

                const batch = getFirestore().batch();

                if(user_exists) {
                    batch.set(user, { profile_image: image_url }, { merge: true });
                };

                if(number_of_posts > 0) {
                    await posts.get().then(snapshot => {
                        snapshot.forEach(doc => {
                            batch.set(doc.ref, { owner: { profile_image: image_url }}, { merge: true });
                        });
                    });
                };

                if(user_in_subcollections_count > 0) {
                    await user_in_subcollections.get().then(snapshot => {
                        snapshot.forEach(doc => {
                            batch.set(doc.ref, { owner: { profile_image: image_url }}, { merge: true });
                        });
                    });
                };

                if(user_comment_likes_subcollections_count > 0) {
                    console.log(user_comment_likes_subcollections_count)
                    await user_in_liked_comments_subcollections.get().then(snapshot => {
                        snapshot.forEach(doc => {
                            batch.set(doc.ref, { owner: { profile_image: image_url }}, { merge: true });
                        });
                    });
                };

                if(activity_in_user_activity_history_subcollection_count > 0) {
                    await activity_in_user_activity_history_subcollection.get().then(snapshot => {
                        snapshot.forEach(doc => {
                            batch.set(doc.ref, { profile_image: image_url }, { merge: true });
                        });
                    });
                };

                await batch.commit()
                    .catch(() => { throw Error('There was an error updating your profile. Please try again.') })

                await getAuth().updateUser(local_uid, { photoURL: image_url })
                    .catch(error => { throw error });

                resolve();
            })
        }).then(() => {
            res.status(200).send({ message: 'Profile successfully updated!' });
        })
        .catch((error) => {
            res.status(500).send({ error });
        })
    } catch(error) {
        res.status(500).send(error);
    };
};

exports.deleteProfileImage = async (req, res) => {
    const local_uid = res.locals.uid;

    try {
        const batch = getFirestore().batch();

        const user = await getFirestore().collection('users').doc(local_uid);
        const user_in_subcollections = getFirestore().collectionGroup('users')
            .where('owner.uid', '==', local_uid);
        const user_in_liked_comments_subcollections = getFirestore().collectionGroup('liked_comments')
            .where('owner.uid', '==', local_uid);
        const activity_in_user_activity_history_subcollection = getFirestore().collectionGroup('activities')
            .where('uid', '==', local_uid);
        const user_posts = getFirestore().collection('posts')
            .where('owner.uid', '==', local_uid);

        const user_exists = (await user.get()).exists;
            
        const number_of_posts = (await user_posts.count().get()).data().count;

        const user_in_subcollections_count = await user_in_subcollections.count().get()
                    .then(value => value.data().count)
                    .catch(error => { throw error });
        
        const user_comment_likes_subcollections_count = await user_in_liked_comments_subcollections.count().get()
            .then(value => value.data().count)
            .catch(error => { throw error });

        const activity_in_user_activity_history_subcollection_count = await activity_in_user_activity_history_subcollection
            .count().get()
            .then(value => value.data().count)
            .catch(error => { throw error });
        
        if(user_exists) {
            batch.set(user, { profile_image: null }, { merge: true });
        }

        if(number_of_posts > 0) {
            await user_posts.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { profile_image: null } }, { merge: true });
                });
            });
        };

        if(user_in_subcollections_count > 0) {
            await user_in_subcollections.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { profile_image: null }}, { merge: true });
                });
            });
        };

        if(user_comment_likes_subcollections_count > 0) {
            await user_in_liked_comments_subcollections.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { profile_image: null }}, { merge: true });
                });
            });
        };

        if(activity_in_user_activity_history_subcollection_count > 0) {
            await activity_in_user_activity_history_subcollection.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { profile_image: null }, { merge: true });
                });
            });
        };

        await batch.commit()
            .catch(() => { throw Error('There was an error updating your profile. Please try again.') })

        await getAuth().updateUser(local_uid, { photoURL: null })
            .catch(error => { throw error });

        res.status(200).send({ message: 'Profile image deleted.' });

    } catch(error) {
        res.status(500).send(error);
    };
};