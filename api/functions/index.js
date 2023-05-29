const { initializeApp } = require('./modules');
const { authGuard } = require('./middleware/auth-guard');
const { createUser } = require('./requests/createUser');
const { uploadBannerImage } = require('./requests/uploads/upload_banner_image');
const { uploadProfileImage } = require('./requests/uploads/upload_profile_image');

initializeApp();

exports.api = {
    createUser,
    uploadProfileImage: authGuard(uploadProfileImage),
    uploadBannerImage: authGuard(uploadBannerImage),
};