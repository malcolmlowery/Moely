const { join } = require('path');
const { tmpdir } = require('os');
const { unlink } = require('fs');
const { randomUUID } = require('crypto');
const { 
    formidable, 
    sharp, 
    bucket,
    getFirestore,
} = require('../../modules');

exports.uploadCoverPhoto = async (req, res) => {
    const local_uid = res.locals.uid;
    
    try {
        const image_name = randomUUID();
        const form = new formidable.IncomingForm();

        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                const uid = fields.uid;
                const file = files.cover_photo_image;

                if(!file) {
                    reject("No file to upload, please choose a image.")
                    return
                };

                const filePath = file.path;
                const tmpFilePath = join(tmpdir(), `${image_name}.jpeg`);
                
                await sharp(filePath)
                    .resize({ height: 300, width: 800, fit: sharp.fit.cover })
                    .toFormat('jpeg', { mozjpeg: true })
                    .toFile(tmpFilePath);

                await bucket.upload(tmpFilePath, { destination: `cover_photo/${image_name}.jpeg`});
                await bucket.file(`cover_photo/${image_name}.jpeg`).makePublic();
                const image_url = await bucket.file(`cover_photo/${image_name}.jpeg`).publicUrl();

                await unlink(tmpFilePath, (error) => {
                    if(error) throw error
                });

                await getFirestore().collection('users').doc(local_uid)
                    .set({ cover_photo: image_url }, { merge: true })
                    .catch(() => { throw Error('There was an error attempting to update your cover photo. Please try again.') });

                resolve();
            })
        }).then(() => {
            res.status(200).send({ message: 'Profile successfully updated!' });
        })
        .catch((error) => {
            res.status(500).send({ error });
        });
        
    } catch(error) {
        res.status(500).send(error)
    };
};

exports.deleteCoverPhoto = async (req, res) => {
    const local_uid = res.locals.uid;

    try {

        await getFirestore().collection('users').doc(local_uid)
            .set({ cover_photo: null }, { merge: true })
            .catch(() => { throw Error('There was an error attempting to delete your cover photo. Please try again.') });

        res.status(200).send({ message: 'Photo cover removed.' });

    } catch(error) {
        res.status(500).send(error);
    }
};;