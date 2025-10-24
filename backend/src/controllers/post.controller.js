const { Post, PostComment, Employee } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Obtenir tous les posts avec filtres
 */
const getPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category,
      authorId,
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (category) where.category = category;
    if (authorId) where.authorId = authorId;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      include: [
        { 
          model: Employee, 
          as: 'author', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        },
        {
          model: PostComment,
          as: 'comments',
          include: [
            {
              model: Employee,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'matricule']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erreur getPosts:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Obtenir un post par ID
 */
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByPk(id, {
      include: [
        { 
          model: Employee, 
          as: 'author', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        },
        {
          model: PostComment,
          as: 'comments',
          include: [
            {
              model: Employee,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'matricule']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    logger.error('Erreur getPostById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Créer un nouveau post
 */
const createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      authorId: req.user.userId
    };
    
    const post = await Post.create(postData);
    
    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('post_created', {
        type: 'post_created',
        data: post,
        message: 'Nouveau post publié'
      });
    }

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    logger.error('Erreur createPost:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Ajouter un commentaire à un post
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }

    const comment = await PostComment.create({
      postId: id,
      authorId: req.user.userId,
      content
    });

    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('post_comment_added', {
        type: 'post_comment_added',
        data: comment,
        message: 'Nouveau commentaire ajouté'
      });
    }

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    logger.error('Erreur addComment:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Liker un post
 */
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà liké
    const existingLike = await PostLike.findOne({
      where: { postId: id, userId: req.user.userId }
    });

    if (existingLike) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post déjà liké' 
      });
    }

    // Créer le like
    await PostLike.create({
      postId: id,
      userId: req.user.userId
    });

    // Incrémenter le compteur de likes
    post.likesCount = (post.likesCount || 0) + 1;
    await post.save();

    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('post_liked', {
        type: 'post_liked',
        data: { postId: id, likesCount: post.likesCount },
        message: 'Post liké'
      });
    }

    res.json({ success: true, data: { likesCount: post.likesCount } });
  } catch (error) {
    logger.error('Erreur likePost:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Statistiques des posts
 */
const getPostStats = async (req, res) => {
  try {
    const totalPosts = await Post.count();
    const todayPosts = await Post.count({
      where: {
        createdAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });
    
    const totalComments = await PostComment.count();
    const totalLikes = await PostLike.count();

    res.json({
      success: true,
      data: {
        totalPosts,
        todayPosts,
        totalComments,
        totalLikes
      }
    });
  } catch (error) {
    logger.error('Erreur getPostStats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  addComment,
  likePost,
  getPostStats
};