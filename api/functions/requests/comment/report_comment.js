const { getFirestore } = require('../../modules');

exports.reportComment = async (req, res) => {
    const local_uid = res.locals.uid;

    try {

    } catch(error) {
        res.status(500).send(error)
    }
};