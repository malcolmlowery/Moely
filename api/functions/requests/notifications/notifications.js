const { getFirestore, FieldValue, Timestamp } = require('../../modules');

exports.createNotification = async (args) => {

    const { 
        type, 
        action,
        local_uid, 
        other_user_uid,
        post_id,
        text,
    } = args;

    const notification_root_doc = getFirestore().collection('notifications').doc(other_user_uid);
    const notification_sub_doc = notification_root_doc.collection('items');
    const timestamp = Timestamp.now().seconds;
    const user = (await getFirestore().collection('users').doc(local_uid).get()).data();
    const notification_root_doc_exists = (await notification_root_doc.get()).exists;

    if(type && !action) {
        if(type === 'like') {
            const item = notification_sub_doc.where('post_id', '==', post_id).where('type', '==', 'like');
            return;
        };

        if(type === 'comment') {
            const item = notification_sub_doc.where('post_id', '==', post_id).where('type', '==', 'like');
            return;
        };

        if(type === 'comment_like') {
            const item = notification_sub_doc.where('post_id', '==', post_id).where('type', '==', 'like');
            return;
        };

        if(type === 'following') {
            const item = notification_sub_doc.where('post_id', '==', post_id).where('type', '==', 'like');
            return;
        };
    };

    if(type && action) {
        if(type === 'like') {
            const item = notification_sub_doc.where('post_id', '==', post_id).where('type', '==', 'like');
            return;
        };

        if(type === 'comment') {
            const item = notification_sub_doc.where('post_id', '==', post_id).where('type', '==', 'like');
            return;
        };

        if(type === 'comment_like') {
            const item = notification_sub_doc.where('post_id', '==', post_id).where('type', '==', 'like');
            return;
        };

        if(type === 'following') {
            const item = notification_sub_doc.where('post_id', '==', post_id).where('type', '==', 'like');
            return;
        };
    };
};