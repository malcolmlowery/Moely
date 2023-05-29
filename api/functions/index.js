const { initializeApp } = require('./modules');
const uploadBannerImage = require('./requests/uploadBannerImage');
const uploadProfileImage = require('./requests/uploadProfileImage');
const createUser = require('./requests/createUser');

initializeApp();

exports.createUser = createUser.createUser;
exports.uploadProfileImage = uploadProfileImage.uploadProfileImage;
exports.uploadBannerImage = uploadBannerImage.uploadBannerImage;