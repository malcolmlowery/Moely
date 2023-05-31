const { initializeApp, getFirestore } = require('./modules');
const { authGuard } = require('./middleware/auth-guard');
const { createUser, getUserProfile, updateUserProfile } = require('./requests/user/user');
const { uploadProfileImage, deleteProfileImage } = require('./requests/uploads/upload_profile_image');
const { uploadCoverPhoto, deleteCoverPhoto } = require('./requests/uploads/upload_cover_photo');
const { createPost, getPost, updatePost, deletePost } = require('./requests/post/post');
const { hidePost, unhidePost } = require('./requests/post/hide_post');
const { createComment, updateComment, deleteComment } = require('./requests/comment/comment');

initializeApp();
getFirestore().settings({ ignoreUndefinedProperties: true })

exports.api = {
    createUser,
    getUserProfile: authGuard(getUserProfile),
    updateUserProfile: authGuard(updateUserProfile),

    uploadProfileImage: authGuard(uploadProfileImage),
    deleteProfileImage: authGuard(deleteProfileImage),

    uploadCoverPhoto: authGuard(uploadCoverPhoto),
    deleteCoverPhoto: authGuard(deleteCoverPhoto),

    createPost: authGuard(createPost),
    getPost: authGuard(getPost),
    updatePost: authGuard(updatePost),
    deletePost: authGuard(deletePost),
    hidePost: authGuard(hidePost),
    unhidePost: authGuard(unhidePost),

    createComment: authGuard(createComment),
    updateComment: authGuard(updateComment),
    deleteComment: authGuard(deleteComment),
};