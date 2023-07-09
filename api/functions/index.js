const { initializeApp, getFirestore } = require('./modules');
const { authGuard } = require('./middleware/auth-guard');
const { createUser, getUserProfile, updateUserProfile, getAccountInfo } = require('./requests/user/user');
const { uploadProfileImage, deleteProfileImage } = require('./requests/uploads/upload_profile_image');
const { uploadCoverPhoto, deleteCoverPhoto } = require('./requests/uploads/upload_cover_photo');
const { createPost, getPost, updatePost, deletePost } = require('./requests/post/post');
const { likePost } = require('./requests/post/like_post');
const { hidePost, unhidePost } = require('./requests/post/hide_post');
const { reportPost } = require('./requests/post/report_post');
const { createComment, updateComment, deleteComment } = require('./requests/comment/comment');
const { likeComment } = require('./requests/comment/like_comment');
const { hideComment } = require('./requests/comment/hide_comment');
const { reportComment } = require('./requests/comment/report_comment');
const { followUser, getFollowers, getFollowing } = require('./requests/user_interactions/follow_user');
const { getNewsfeedPosts } = require('./requests/post/posts');
const { getPostComments } = require('./requests/comment/comments');
const { getUserProfileNewsfeed } = require('./requests/post/profile_posts');
const { getUserActivityHistory } = require('./requests/user/user_activity_history');

initializeApp();
getFirestore().settings({ ignoreUndefinedProperties: true })

exports.api = {
    createUser,
    getUserProfile: authGuard(getUserProfile),
    getUserProfileNewsfeed: authGuard(getUserProfileNewsfeed),
    updateUserProfile: authGuard(updateUserProfile),
    getAccountInfo: authGuard(getAccountInfo),

    uploadProfileImage: authGuard(uploadProfileImage),
    deleteProfileImage: authGuard(deleteProfileImage),

    uploadCoverPhoto: authGuard(uploadCoverPhoto),
    deleteCoverPhoto: authGuard(deleteCoverPhoto),

    createPost: authGuard(createPost),
    getPost: authGuard(getPost),
    getNewsfeedPosts: authGuard(getNewsfeedPosts),
    updatePost: authGuard(updatePost),
    deletePost: authGuard(deletePost),
    likePost: authGuard(likePost),
    hidePost: authGuard(hidePost),
    unhidePost: authGuard(unhidePost),
    reportPost: authGuard(reportPost),

    createComment: authGuard(createComment),
    getPostComments: authGuard(getPostComments),
    updateComment: authGuard(updateComment),
    deleteComment: authGuard(deleteComment),
    likeComment: authGuard(likeComment),
    hideComment: authGuard(hideComment),
    reportComment: authGuard(reportComment),

    followUser: authGuard(followUser),
    getFollowers: authGuard(getFollowers),
    getFollowing: authGuard(getFollowing),

    getUserActivityHistory: authGuard(getUserActivityHistory),
};