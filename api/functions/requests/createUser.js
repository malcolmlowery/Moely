const { functions, getAuth, getFirestore, Timestamp } = require('../modules');

exports.createUser = functions.https.onRequest(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user_doc = getFirestore().collection('users').doc();

        await getAuth().createUser({ displayName: username, email, password, uid: user_doc.id })
            .catch((error) => { throw error });

        await user_doc.create({ uid: user_doc.id, username, email })
            .catch(() => { throw 'There was an error creating your profile. Please try again.' });
            
        res.status(200).send({ message: 'Account created successfully!' });

    } catch(error) {
        res.status(500).send(error);
    };
});