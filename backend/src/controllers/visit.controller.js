const { Visit, Visitor, Employee } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Obtenir toutes les visites avec filtres
 */
const getVisits = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      date, 
      visitorName,
      employeeId 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }
    if (employeeId) where.employeeId = employeeId;

    const { count, rows: visits } = await Visit.findAndCountAll({
      where,
      include: [
        { model: Visitor, as: 'visitor' },
        { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'matricule'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: visits,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erreur getVisits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Obtenir une visite par ID
 */
const getVisitById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const visit = await Visit.findByPk(id, {
      include: [
        { model: Visitor, as: 'visitor' },
        { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'matricule'] }
      ]
    });

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visite non trouvée' });
    }

    res.json({ success: true, data: visit });
  } catch (error) {
    logger.error('Erreur getVisitById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Créer une nouvelle visite
 */
const createVisit = async (req, res) => {
  try {
    const visitData = req.body;
    
    const visit = await Visit.create(visitData);
    
    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('visit_created', {
        type: 'visit_created',
        data: visit,
        message: 'Nouvelle visite enregistrée'
      });
    }

    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    logger.error('Erreur createVisit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Check-in d'un visiteur
 */
const checkinVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const { badgeNumber } = req.body;
    
    const visit = await Visit.findByPk(id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visite non trouvée' });
    }

    visit.status = 'checked_in';
    visit.checkinTime = new Date();
    if (badgeNumber) visit.badgeNumber = badgeNumber;
    
    await visit.save();

    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('visit_checked_in', {
        type: 'visit_checked_in',
        data: visit,
        message: 'Visiteur check-in effectué'
      });
    }

    res.json({ success: true, data: visit });
  } catch (error) {
    logger.error('Erreur checkinVisitor:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Check-out d'un visiteur
 */
const checkoutVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const visit = await Visit.findByPk(id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visite non trouvée' });
    }

    visit.status = 'checked_out';
    visit.checkoutTime = new Date();
    if (notes) visit.notes = notes;
    
    await visit.save();

    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('visit_checked_out', {
        type: 'visit_checked_out',
        data: visit,
        message: 'Visiteur check-out effectué'
      });
    }

    res.json({ success: true, data: visit });
  } catch (error) {
    logger.error('Erreur checkoutVisitor:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Obtenir les visites du jour
 */
const getTodaysVisits = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const visits = await Visit.findAll({
      where: {
        createdAt: { [Op.between]: [today, tomorrow] }
      },
      include: [
        { model: Visitor, as: 'visitor' },
        { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'matricule'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: visits });
  } catch (error) {
    logger.error('Erreur getTodaysVisits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Statistiques des visites
 */
const getVisitStats = async (req, res) => {
  try {
    const totalVisits = await Visit.count();
    const todayVisits = await Visit.count({
      where: {
        createdAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });
    
    const checkedInToday = await Visit.count({
      where: {
        status: 'checked_in',
        createdAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalVisits,
        todayVisits,
        checkedInToday,
        pendingCheckout: checkedInToday
      }
    });
  } catch (error) {
    logger.error('Erreur getVisitStats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getVisits,
  getVisitById,
  createVisit,
  checkinVisitor,
  checkoutVisitor,
  getTodaysVisits,
  getVisitStats
};