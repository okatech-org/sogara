const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le titre est requis' }
    }
  },
  
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le contenu est requis' }
    }
  },
  
  category: {
    type: DataTypes.ENUM('news', 'announcement', 'event', 'safety', 'training', 'other'),
    allowNull: false,
    defaultValue: 'news'
  },
  
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'draft'
  },
  
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date d\'expiration du post'
  },
  
  targetAudience: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'Audience cible (services, rôles)',
    defaultValue: []
  },
  
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'Tags pour la recherche',
    defaultValue: []
  },
  
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'URLs des fichiers joints',
    defaultValue: []
  },
  
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'URLs des images',
    defaultValue: []
  },
  
  likesCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  commentsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  viewsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  isPinned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Post épinglé en haut'
  },
  
  allowComments: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  
  requiresAcknowledgment: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Nécessite un accusé de réception'
  },
  
  acknowledgmentDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  acknowledgedBy: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: true,
    comment: 'Liste des employés ayant accusé réception',
    defaultValue: []
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'posts',
  timestamps: true,
  
  hooks: {
    beforeUpdate: (post) => {
      if (post.changed('status') && post.status === 'published' && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }
  }
});

module.exports = Post;