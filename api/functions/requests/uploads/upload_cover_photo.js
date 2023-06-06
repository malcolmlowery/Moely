const { join } = require('path');
const { tmpdir } = require('os');
const { unlink } = require('fs');
const { randomUUID } = require('crypto');
const { 
    formidable, 
    sharp, 
    bucket,
    getFirestore,
    vision,
} = require('../../modules');

const vision_client = new vision.ImageAnnotatorClient({ keyFilename: '/Users/malcolmlowery/Documents/MedRant/api/functions/credentials/fb-service-account.json' });

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