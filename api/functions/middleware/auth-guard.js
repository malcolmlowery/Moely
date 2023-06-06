const { functions, getAuth } = require('../modules');

exports.authGuard = (endpoint) => functions.https.onRequest(async (req ,res) => {
    let isAuth = true;
    
    if(!isAuth) {
        res.status(403).send({ message: 'Your request to this endpoint is unauthorized.' })
        return
    };

    res.locals.uid = 's3Lo4W7O0QmfKxo5GXtw'

    return endpoint(req, res);
});