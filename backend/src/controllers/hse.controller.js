const { HSEIncident, HSETraining, Employee } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Obtenir tous les incidents HSE avec filtres
 */
const getIncidents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      severity, 
      status,
      date,
      reporterId 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (reporterId) where.reporterId = reporterId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows: incidents } = await HSEIncident.findAndCountAll({
      where,
      include: [
        { 
          model: Employee, 
          as: 'reporter', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: incidents,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erreur getIncidents:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Créer un nouvel incident HSE
 */
const createIncident = async (req, res) => {
  try {
    const incidentData = {
      ...req.body,
      reporterId: req.user.userId
    };
    
    const incident = await HSEIncident.create(incidentData);
    
    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('hse_incident_created', {
        type: 'hse_incident_created',
        data: incident,
        message: 'Nouvel incident HSE signalé',
        severity: incident.severity
      });
    }

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    logger.error('Erreur createIncident:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Mettre à jour le statut d'un incident
 */
const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const incident = await HSEIncident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident non trouvé' });
    }

    incident.status = status;
    if (notes) incident.notes = notes;
    incident.updatedAt = new Date();
    
    await incident.save();

    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('hse_incident_updated', {
        type: 'hse_incident_updated',
        data: incident,
        message: `Incident ${status}`
      });
    }

    res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Erreur updateIncidentStatus:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Obtenir les formations HSE
 */
const getTrainings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      type,
      employeeId 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (employeeId) where.employeeId = employeeId;

    const { count, rows: trainings } = await HSETraining.findAndCountAll({
      where,
      include: [
        { 
          model: Employee, 
          as: 'employee', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: trainings,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erreur getTrainings:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Créer une nouvelle formation HSE
 */
const createTraining = async (req, res) => {
  try {
    const trainingData = req.body;
    
    const training = await HSETraining.create(trainingData);
    
    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('hse_training_created', {
        type: 'hse_training_created',
        data: training,
        message: 'Nouvelle formation HSE programmée'
      });
    }

    res.status(201).json({ success: true, data: training });
  } catch (error) {
    logger.error('Erreur createTraining:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Statistiques HSE
 */
const getHSEStats = async (req, res) => {
  try {
    const totalIncidents = await HSEIncident.count();
    const openIncidents = await HSEIncident.count({
      where: { status: 'open' }
    });
    const criticalIncidents = await HSEIncident.count({
      where: { severity: 'critical' }
    });
    
    const totalTrainings = await HSETraining.count();
    const completedTrainings = await HSETraining.count({
      where: { status: 'completed' }
    });
    const upcomingTrainings = await HSETraining.count({
      where: { 
        status: 'scheduled',
        startDate: { [Op.gte]: new Date() }
      }
    });

    res.json({
      success: true,
      data: {
        incidents: {
          total: totalIncidents,
          open: openIncidents,
          critical: criticalIncidents
        },
        trainings: {
          total: totalTrainings,
          completed: completedTrainings,
          upcoming: upcomingTrainings
        }
      }
    });
  } catch (error) {
    logger.error('Erreur getHSEStats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getIncidents,
  createIncident,
  updateIncidentStatus,
  getTrainings,
  createTraining,
  getHSEStats
};