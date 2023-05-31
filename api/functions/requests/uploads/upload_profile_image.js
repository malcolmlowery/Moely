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
} = require('../../modules');

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
                const posts = getFirestore().collection('posts')
                    .where('owner.uid', '==', local_uid);
                const comments = getFirestore().collection('comments')
                    .where('owner.uid', '==', local_uid);
                const post_likes = getFirestore().collection('post_likes')
                    .where('owner.uid', '==', local_uid);

                const user_exists = (await user.get()).exists
                
                const number_of_posts = await posts.count().get()
                    .then(value => value.data().count)
                    .catch(error => { throw error });

                const number_of_comments = await comments.count().get()
                    .then(value => value.data().count)
                    .catch(error => { throw error });

                const number_of_post_likes = await post_likes.count().get()
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

                if(number_of_comments > 0) {
                    await comments.get().then(snapshot => {
                        snapshot.forEach(doc => {
                            batch.set(doc.ref, { owner: { profile_image: image_url }}, { merge: true });
                        });
                    });
                };

                if(number_of_post_likes > 0) {
                    await post_likes.get().then(snapshot => {
                        snapshot.forEach(doc => {
                            batch.set(doc.ref, { owner: { profile_image: image_url }}, { merge: true });
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
        const user_posts = getFirestore().collection('posts')
            .where('owner.uid', '==', local_uid);
        const user_liked_posts = getFirestore().collection('post_likes')
            .where('owner.uid', '==', local_uid);
        const user_comments = getFirestore().collection('comments')
            .where('owner.uid', '==', local_uid);

        const user_exists = (await user.get()).exists;
            
        const total_user_posts = (await user_posts.count().get()).data().count;
        const total_liked_posts = (await user_liked_posts.count().get()).data().count;
        const total_user_comments = (await user_comments.count().get()).data().count;
        
        if(user_exists) {
            batch.set(user, { profile_image: null }, { merge: true });
        }

        if(total_user_posts > 0) {
            await user_posts.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { profile_image: null } }, { merge: true });
                });
            });
        };

        if(total_liked_posts > 0) {
            await user_liked_posts.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { profile_image: null } }, { merge: true });
                });
            });
        };

        if(total_user_comments > 0) {
            await user_comments.get().then(snapshot => {
                snapshot.forEach(doc => {
                    batch.set(doc.ref, { owner: { profile_image: null } }, { merge: true });
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