const express = require('express');
const router = express.Router();

const UserController  = require('../Controllers/UserControl');

const BlogController = require('../Controllers/BlogControl');

const authMiddleware = require('../Auth/UserAuth');

const adminMiddleware = require('../Auth/AdminAuth');

// User routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/user/:id', UserController.getUserProfile);
router.put('/user/:id', authMiddleware, UserController.updateUserProfile);

// Blog routes
router.post('/posts', authMiddleware, BlogController.createBlogPost);
router.get('/posts', BlogController.getPosts);
router.get('/posts/:id', BlogController.getBlogPost);
router.put('/posts/:id', authMiddleware, BlogController.updateBlogPost);
router.delete('/posts/:id', authMiddleware, BlogController.deleteBlogPost);
router.put('/posts/:id/rate', authMiddleware, BlogController.rateBlogPost);
router.post('/posts/:id/comment', authMiddleware, BlogController.createComment);

// Admin routes
router.get('/admin/users', adminMiddleware, UserController.getAllUsers);
router.delete('/admin/users/:id', adminMiddleware, UserController.blockUser);
router.delete('/admin/posts/:id', adminMiddleware, BlogController.disablePost);


// Follower routes
router.post('/user/:id/follow', authMiddleware, UserController.followUser);

// Feed routes
router.get('/user/:id/feed', authMiddleware, UserController.getFeed);

// Notification routes
router.get('/user/:id/notifications', authMiddleware, UserController.getNotifications);

// Search routes
router.get('/user/search', BlogController.searchPosts);

module.exports = router;