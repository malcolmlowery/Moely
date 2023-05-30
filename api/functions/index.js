const { initializeApp, getFirestore } = require('./modules');
const { authGuard } = require('./middleware/auth-guard');
const { createUser, updateUserProfile } = require('./requests/user/user');
const { uploadProfileImage, deleteProfileImage } = require('./requests/uploads/upload_profile_image');
const { uploadCoverPhoto, deleteCoverPhoto } = require('./requests/uploads/upload_cover_photo');
const { createPost } = require('./requests/post/post');

initializeApp();
getFirestore().settings({ ignoreUndefinedProperties: true })

exports.api = {
    createUser,
    updateUserProfile: authGuard(updateUserProfile),
    uploadProfileImage: authGuard(uploadProfileImage),
    deleteProfileImage: authGuard(deleteProfileImage),
    uploadCoverPhoto: authGuard(uploadCoverPhoto),
    deleteCoverPhoto: authGuard(deleteCoverPhoto),
    createPost: authGuard(createPost),
};