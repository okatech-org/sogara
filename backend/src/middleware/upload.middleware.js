const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Déterminer le dossier de destination basé sur le type de fichier
    let uploadPath = process.env.UPLOAD_DIR || './uploads';
    
    // Créer des sous-dossiers par type
    if (file.fieldname.includes('photo') || file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadPath, 'images');
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = path.join(uploadPath, 'documents');
    } else {
      uploadPath = path.join(uploadPath, 'files');
    }
    
    // Créer le dossier s'il n'existe pas
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtre des types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Type de fichier non autorisé: ${file.mimetype}`);
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

// Configuration multer principal
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB par défaut
    files: 5 // Maximum 5 fichiers par requête
  }
});

// Middleware pour upload d'image unique
const uploadSingleImage = upload.single('image');

// Middleware pour upload de photo de profil
const uploadProfilePhoto = upload.single('photo');

// Middleware pour upload multiple d'images
const uploadMultipleImages = upload.array('images', 5);

// Middleware pour upload de document
const uploadDocument = upload.single('document');

// Middleware pour upload mixte (images + documents)
const uploadMixed = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 3 },
  { name: 'photo', maxCount: 1 }
]);

// Middleware de gestion des erreurs d'upload
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({
          success: false,
          message: 'Fichier trop volumineux',
          maxSize: `${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1024 / 1024}MB`
        });
      
      case 'LIMIT_FILE_COUNT':
        return res.status(413).json({
          success: false,
          message: 'Trop de fichiers',
          maxFiles: 5
        });
      
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Champ de fichier inattendu',
          expectedFields: ['image', 'images', 'photo', 'document', 'documents']
        });
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Erreur d\'upload',
          error: error.message
        });
    }
  }
  
  if (error.message.includes('Type de fichier non autorisé')) {
    return res.status(415).json({
      success: false,
      message: error.message,
      allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || []
    });
  }
  
  next(error);
};

// Middleware pour traitement post-upload
const processUpload = (req, res, next) => {
  if (req.file) {
    // Upload d'un seul fichier
    req.uploadedFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${path.relative('./uploads', req.file.path).replace(/\\/g, '/')}`
    };
    
    logger.info(`Fichier uploadé: ${req.file.originalname} (${req.file.size} bytes)`);
  }
  
  if (req.files) {
    req.uploadedFiles = {};
    
    // Upload multiple ou de champs nommés
    if (Array.isArray(req.files)) {
      // Upload d'un array de fichiers
      req.uploadedFiles.files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${path.relative('./uploads', file.path).replace(/\\/g, '/')}`
      }));
      
      logger.info(`${req.files.length} fichiers uploadés`);
    } else {
      // Upload de champs nommés
      Object.keys(req.files).forEach(fieldName => {
        req.uploadedFiles[fieldName] = req.files[fieldName].map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/${path.relative('./uploads', file.path).replace(/\\/g, '/')}`
        }));
      });
      
      const totalFiles = Object.values(req.files).flat().length;
      logger.info(`${totalFiles} fichiers uploadés dans ${Object.keys(req.files).length} champs`);
    }
  }
  
  next();
};

// Fonction utilitaire pour supprimer un fichier
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      return resolve();
    }
    
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        logger.error(`Erreur suppression fichier ${fullPath}:`, err);
        reject(err);
      } else {
        logger.info(`Fichier supprimé: ${fullPath}`);
        resolve();
      }
    });
  });
};

// Fonction utilitaire pour supprimer plusieurs fichiers
const deleteFiles = async (filePaths) => {
  if (!Array.isArray(filePaths)) {
    filePaths = [filePaths];
  }
  
  const deletePromises = filePaths.filter(Boolean).map(deleteFile);
  
  try {
    await Promise.allSettled(deletePromises);
  } catch (error) {
    logger.error('Erreur lors de la suppression de fichiers:', error);
  }
};

// Middleware de nettoyage en cas d'erreur
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Si la réponse est une erreur, supprimer les fichiers uploadés
    if (res.statusCode >= 400) {
      const filesToDelete = [];
      
      if (req.file) {
        filesToDelete.push(req.file.path);
      }
      
      if (req.files) {
        if (Array.isArray(req.files)) {
          filesToDelete.push(...req.files.map(f => f.path));
        } else {
          Object.values(req.files).flat().forEach(f => {
            filesToDelete.push(f.path);
          });
        }
      }
      
      if (filesToDelete.length > 0) {
        deleteFiles(filesToDelete).catch(err => {
          logger.error('Erreur nettoyage fichiers:', err);
        });
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Route handler pour l'upload général
const uploadHandler = (req, res) => {
  try {
    const response = {
      success: true,
      message: 'Upload réussi',
      timestamp: new Date().toISOString()
    };
    
    if (req.uploadedFile) {
      response.file = req.uploadedFile;
    }
    
    if (req.uploadedFiles) {
      response.files = req.uploadedFiles;
    }
    
    res.json(response);
  } catch (error) {
    logger.error('Erreur handler upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement de l\'upload'
    });
  }
};

module.exports = {
  upload,
  uploadSingleImage,
  uploadProfilePhoto,
  uploadMultipleImages,
  uploadDocument,
  uploadMixed,
  handleUploadErrors,
  processUpload,
  cleanupOnError,
  uploadHandler,
  deleteFile,
  deleteFiles
};
