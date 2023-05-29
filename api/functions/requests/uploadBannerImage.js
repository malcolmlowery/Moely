const { join } = require('path');
const { tmpdir } = require('os');
const { unlink } = require('fs');
const { randomUUID } = require('crypto');
const { 
    functions,
    formidable, 
    sharp, 
    bucket,
    getFirestore,
} = require('../modules');

exports.uploadBannerImage = functions.https.onRequest(async (req, res) => {
    try {
        const image_name = randomUUID();
        const form = new formidable.IncomingForm();

        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                const uid = fields.uid;
                const file = files.banner_image;

                if (!file) {
                    reject("No file to upload, please choose a image.")
                    return
                }

                const filePath = file.path;
                const tmpFilePath = join(tmpdir(), `${image_name}.jpeg`)
                
                await sharp(filePath)
                    .resize({ height: 300, width: 800, fit: sharp.fit.cover })
                    .toFormat('jpeg', { mozjpeg: true })
                    .toFile(tmpFilePath)

                await bucket.upload(tmpFilePath, { destination: `banner_images/${image_name}.jpeg`})
                await bucket.file(`banner_images/${image_name}.jpeg`).makePublic()
                const image_url = await bucket.file(`banner_images/${image_name}.jpeg`).publicUrl()

                await unlink(tmpFilePath, (error) => {
                    if(error) throw error
                })

                await getFirestore().collection('users')
                    .doc(uid).set({ banner_image: image_url }, { merge: true })
                    .catch(() => { throw { message: 'An error occurred updating your profile. Please try again.' }})

                resolve()
            })
        }).then(() => {
            res.status(200).send({ message: 'Profile successfully updated!' })
        })
        .catch((error) => {
            res.status(500).send({ error });
        })
    } catch(error) {
        res.status(500).send(error)
    }
});