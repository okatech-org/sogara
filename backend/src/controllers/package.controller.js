const { PackageMail, Employee } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Obtenir tous les colis avec filtres
 */
const getPackages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      date, 
      recipientId,
      type 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (recipientId) where.recipientId = recipientId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows: packages } = await PackageMail.findAndCountAll({
      where,
      include: [
        { 
          model: Employee, 
          as: 'recipient', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: packages,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erreur getPackages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Obtenir un colis par ID
 */
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const packageItem = await PackageMail.findByPk(id, {
      include: [
        { 
          model: Employee, 
          as: 'recipient', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        }
      ]
    });

    if (!packageItem) {
      return res.status(404).json({ success: false, message: 'Colis non trouvé' });
    }

    res.json({ success: true, data: packageItem });
  } catch (error) {
    logger.error('Erreur getPackageById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Créer un nouveau colis
 */
const createPackage = async (req, res) => {
  try {
    const packageData = req.body;
    
    const packageItem = await PackageMail.create(packageData);
    
    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('package_created', {
        type: 'package_created',
        data: packageItem,
        message: 'Nouveau colis enregistré'
      });
    }

    res.status(201).json({ success: true, data: packageItem });
  } catch (error) {
    logger.error('Erreur createPackage:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Marquer un colis comme récupéré
 */
const markAsDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveredBy, notes } = req.body;
    
    const packageItem = await PackageMail.findByPk(id);
    if (!packageItem) {
      return res.status(404).json({ success: false, message: 'Colis non trouvé' });
    }

    packageItem.status = 'delivered';
    packageItem.deliveredAt = new Date();
    if (deliveredBy) packageItem.deliveredBy = deliveredBy;
    if (notes) packageItem.notes = notes;
    
    await packageItem.save();

    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('package_delivered', {
        type: 'package_delivered',
        data: packageItem,
        message: 'Colis marqué comme livré'
      });
    }

    res.json({ success: true, data: packageItem });
  } catch (error) {
    logger.error('Erreur markAsDelivered:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Obtenir les colis du jour
 */
const getTodaysPackages = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const packages = await PackageMail.findAll({
      where: {
        createdAt: { [Op.between]: [today, tomorrow] }
      },
      include: [
        { 
          model: Employee, 
          as: 'recipient', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: packages });
  } catch (error) {
    logger.error('Erreur getTodaysPackages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Statistiques des colis
 */
const getPackageStats = async (req, res) => {
  try {
    const totalPackages = await PackageMail.count();
    const todayPackages = await PackageMail.count({
      where: {
        createdAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });
    
    const pendingDelivery = await PackageMail.count({
      where: {
        status: 'pending',
        createdAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });

    const deliveredToday = await PackageMail.count({
      where: {
        status: 'delivered',
        deliveredAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalPackages,
        todayPackages,
        pendingDelivery,
        deliveredToday
      }
    });
  } catch (error) {
    logger.error('Erreur getPackageStats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  markAsDelivered,
  getTodaysPackages,
  getPackageStats
};