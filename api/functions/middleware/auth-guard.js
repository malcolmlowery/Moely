const { functions, getAuth } = require('../modules');

exports.authGuard = (endpoint) => functions.https.onRequest(async (req ,res) => {
    let isAuth = true;
    
    if(!isAuth) {
        res.status(403).send({ message: 'Your request to this endpoint is unauthorized.' })
        return
    };

    res.locals.uid = 'G2m40sa1pqRDSuOK5X83'

    return endpoint(req, res);
});