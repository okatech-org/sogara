const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  getPosts,
  getPostById,
  createPost,
  addComment,
  likePost,
  getPostStats
} = require('../controllers/post.controller');

// Import des middlewares
const { requirePermissions } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/posts
 * @desc    Obtenir tous les posts
 * @access  Private (Authenticated)
 */
router.get('/', 
  requirePermissions('read:posts'),
  getPosts
);

/**
 * @route   GET /api/posts/stats/overview
 * @desc    Obtenir les statistiques des posts
 * @access  Private (Authenticated)
 */
router.get('/stats/overview',
  requirePermissions('read:posts'),
  getPostStats
);

/**
 * @route   GET /api/posts/:id
 * @desc    Obtenir un post par ID
 * @access  Private (Authenticated)
 */
router.get('/:id',
  requirePermissions('read:posts'),
  getPostById
);

/**
 * @route   POST /api/posts
 * @desc    Créer un nouveau post
 * @access  Private (Communication, Admin)
 */
router.post('/',
  requirePermissions('write:posts'),
  createPost
);

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Ajouter un commentaire à un post
 * @access  Private (Authenticated)
 */
router.post('/:id/comments',
  requirePermissions('write:posts'),
  addComment
);

/**
 * @route   POST /api/posts/:id/like
 * @desc    Liker un post
 * @access  Private (Authenticated)
 */
router.post('/:id/like',
  requirePermissions('write:posts'),
  likePost
);

module.exports = router;