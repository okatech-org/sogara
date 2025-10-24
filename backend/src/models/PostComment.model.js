const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostComment = sequelize.define('PostComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le contenu du commentaire est requis' },
      len: {
        args: [1, 1000],
        msg: 'Le commentaire doit contenir entre 1 et 1000 caractères'
      }
    }
  },
  
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'post_comments',
      key: 'id'
    },
    comment: 'ID du commentaire parent (pour les réponses)'
  },
  
  status: {
    type: DataTypes.ENUM('active', 'hidden', 'deleted'),
    allowNull: false,
    defaultValue: 'active'
  },
  
  likesCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  isEdited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'URLs des fichiers joints',
    defaultValue: []
  }
}, {
  tableName: 'post_comments',
  timestamps: true
});

module.exports = PostComment;
