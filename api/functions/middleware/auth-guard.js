const { functions, getAuth } = require('../modules');

exports.authGuard = (endpoint) => functions.https.onRequest(async (req ,res) => {
    let isAuth = true;
    
    if(!isAuth) {
        res.status(403).send({ message: 'Your request to this endpoint is unauthorized.' })
        return
    };

    res.locals.uid = 'Y5deV9au6zvhfBu5WQsb'

    return endpoint(req, res);
});