const { functions, getAuth } = require('../modules');

exports.authGuard = (endpoint) => functions.https.onRequest(async (req ,res) => {
    let isAuth = true;
    
    if(!isAuth) {
        res.status(403).send({ message: 'Your request to this endpoint is unauthorized.' })
        return
    };

    res.locals.uid = 'jxdEv5N67nKojHX86oRW'

    return endpoint(req, res);
});