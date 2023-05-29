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
    getAuth,
} = require('../modules');

exports.uploadProfileImage = functions.https.onRequest(async (req, res) => {
    try {
        const image_name = randomUUID();
        const form = new formidable.IncomingForm();

        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                const uid = fields.uid;
                const file = files.profile_image;
                
                if (!file) {
                    reject("No file to upload, please choose a image.")
                    return
                }

                const filePath = file.path;
                const tmpFilePath = join(tmpdir(), `${image_name}.jpeg`)
                
                await sharp(filePath)
                    .resize({ height: 200, width: 200 })
                    .toFormat('jpeg', { mozjpeg: true })
                    .toFile(tmpFilePath)

                await bucket.upload(tmpFilePath, { destination: `profile_images/${image_name}.jpeg`})
                await bucket.file(`profile_images/${image_name}.jpeg`).makePublic()
                const image_url = await bucket.file(`profile_images/${image_name}.jpeg`).publicUrl()
          
                await unlink(tmpFilePath, (error) => {
                    if(error) throw error
                })

                await getAuth().updateUser(uid, { photoURL: image_url })
                    .catch(() => { throw { message: 'An error occurred updating your profile. Please try again.' }})

                await getFirestore().collection('users')
                    .doc(uid).set({ profile_image: image_url}, { merge: true })
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