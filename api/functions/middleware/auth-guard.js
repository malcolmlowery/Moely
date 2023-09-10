const { functions, getAuth } = require('../modules');

exports.authGuard = (endpoint) => functions.https.onRequest(async (req ,res) => {
    const authorization = req.headers.authorization;
    const token = authorization.split(' ')[1];

    if(token === undefined) {
        res.status(401).send({ message: 'Unauthorized' })
        return;
    };

    try {
        const { uid } = await getAuth()
            .verifyIdToken(token, true)
            .then(user => user)
            .catch((err) => { throw err })

        res.locals.uid = uid
        return endpoint(req, res);
        
    } catch(err) {
        res.status(500).send({ message: err.message })
        return 
    };
});