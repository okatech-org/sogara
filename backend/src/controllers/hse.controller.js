const { HSEIncident, HSETraining, HSEAudit, Employee } = require('../models');
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
    const { severity, title, description, location, category, affectedEmployees, injuryLevel, environmentalImpact } = req.body;
    
    // Determine if needs HSE001 approval
    const requiresHSE001 = ['critical', 'high'].includes(severity);
    
    // Set priority based on severity
    let priority = 'P3_MEDIUM';
    if (severity === 'critical') priority = 'P1_CRITICAL';
    else if (severity === 'high') priority = 'P2_HIGH';
    else if (severity === 'low') priority = 'P4_LOW';
    
    const incidentData = {
      ...req.body,
      reporterId: req.user.userId,
      approvalStatus: 'pending',
      priority: priority,
      assignedTo: requiresHSE001 ? null : req.user.userId, // Auto-assign to HSE002 if low/medium
      notifications: {
        toHSE001: requiresHSE001,
        toDirector: false,
        toOthers: []
      }
    };
    
    const incident = await HSEIncident.create(incidentData);
    
    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Notify HSE001 if critical/high
      if (requiresHSE001) {
        io.emit('hse_incident_critical', {
          type: 'hse_incident_critical',
          data: incident,
          message: `Nouvel incident ${severity.toUpperCase()} signalé: ${title}`,
          severity: incident.severity,
          targetUser: 'HSE001'
        });
      } else {
        // Notify HSE002 for routine incidents
        io.emit('hse_incident_created', {
          type: 'hse_incident_created',
          data: incident,
          message: 'Nouvel incident HSE signalé',
          severity: incident.severity,
          targetUser: 'HSE002'
        });
      }
    }

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    logger.error('Erreur createIncident:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Approuver un incident (HSE002 ou HSE001)
 */
const approveIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const incident = await HSEIncident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident non trouvé' });
    }
    
    // Check if user can approve this incident
    const canApprove = 
      (userRole === 'HSE_MANAGER' && ['medium', 'low'].includes(incident.severity)) ||
      userRole === 'HSSE_CHIEF';
    
    if (!canApprove) {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous ne pouvez pas approuver cet incident' 
      });
    }
    
    // Update approval status
    incident.approvalStatus = userRole === 'HSE_MANAGER' ? 
      'approved_hse002' : 'approved_hse001';
    incident.approvedBy = userId;
    incident.approvalDate = new Date();
    incident.status = 'investigating';
    
    if (comment) {
      incident.investigationNotes = comment;
    }
    
    await incident.save();
    
    // Notify via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('hse_incident_approved', {
        type: 'hse_incident_approved',
        data: incident,
        message: `Incident approuvé par ${userRole === 'HSE_MANAGER' ? 'HSE002' : 'HSE001'}`,
        approvedBy: userId
      });
    }
    
    res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Erreur approveIncident:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Escalader un incident vers HSE001 (HSE002 only)
 */
const escalateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    if (req.user.role !== 'HSE_MANAGER') {
      return res.status(403).json({ 
        success: false, 
        message: 'Seul HSE002 peut escalader vers HSE001' 
      });
    }
    
    const incident = await HSEIncident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident non trouvé' });
    }
    
    incident.approvalStatus = 'requires_hse001';
    incident.status = 'action_required';
    incident.assignedTo = null; // Will be assigned by HSE001
    incident.updatedAt = new Date();
    
    await incident.save();
    
    // Notify HSE001 immediately
    const io = req.app.get('io');
    if (io) {
      io.emit('hse_incident_escalated', {
        type: 'hse_incident_escalated',
        data: incident,
        message: `Incident escaladé par HSE002: ${incident.title}`,
        severity: incident.severity,
        priority: 'high',
        targetUser: 'HSE001'
      });
    }
    
    res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Erreur escalateIncident:', error);
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

/**
 * Obtenir tous les audits HSE
 */
const getAudits = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type,
      status,
      auditedBy 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (auditedBy) where.auditedBy = auditedBy;

    const { count, rows: audits } = await HSEAudit.findAndCountAll({
      where,
      include: [
        { 
          model: Employee, 
          as: 'auditor', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: audits,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erreur getAudits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Créer un nouvel audit HSE
 */
const createAudit = async (req, res) => {
  try {
    const auditData = {
      ...req.body,
      auditedBy: req.user.userId
    };
    
    const audit = await HSEAudit.create(auditData);
    
    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('hse_audit_created', {
        type: 'hse_audit_created',
        data: audit,
        message: 'Nouvel audit HSE programmé'
      });
    }

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    logger.error('Erreur createAudit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Générer un rapport d'audit
 */
const generateAuditReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const audit = await HSEAudit.findByPk(id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit non trouvé' });
    }
    
    // Generate PDF report (placeholder for now)
    const reportUrl = `/reports/audit-${audit.id}-${Date.now()}.pdf`;
    
    audit.reportGenerated = true;
    audit.reportUrl = reportUrl;
    audit.reportDate = new Date();
    audit.status = 'reported';
    await audit.save();
    
    res.json({ 
      success: true, 
      data: audit,
      reportUrl: reportUrl
    });
  } catch (error) {
    logger.error('Erreur generateAuditReport:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Add corrective action to incident (HSE002)
 */
const addCorrectiveAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, assignedTo, dueDate } = req.body;
    
    const incident = await HSEIncident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident non trouvé' });
    }
    
    const correctiveAction = {
      id: Date.now().toString(),
      action,
      assignedTo,
      dueDate: new Date(dueDate),
      status: 'pending',
      createdAt: new Date()
    };
    
    if (!incident.correctiveActions) {
      incident.correctiveActions = [];
    }
    incident.correctiveActions.push(correctiveAction);
    await incident.save();
    
    res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Erreur addCorrectiveAction:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Close incident (HSE002)
 */
const closeIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const incident = await HSEIncident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident non trouvé' });
    }
    
    incident.status = 'closed';
    incident.closedDate = new Date();
    incident.closedBy = req.user.userId;
    if (notes) incident.notes = notes;
    
    await incident.save();
    
    // Notify via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('hse_incident_closed', {
        type: 'hse_incident_closed',
        data: incident,
        message: `Incident fermé par ${req.user.role === 'HSE_MANAGER' ? 'HSE002' : 'HSE001'}`
      });
    }
    
    res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Erreur closeIncident:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Enroll participant in training (HSE002)
 */
const enrollParticipant = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    
    const training = await HSETraining.findByPk(id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Formation non trouvée' });
    }
    
    // Add participant to training schedule
    if (!training.schedule) {
      training.schedule = { sessions: [] };
    }
    
    // Implementation would depend on the specific training structure
    // This is a placeholder for the enrollment logic
    
    res.json({ success: true, data: training });
  } catch (error) {
    logger.error('Erreur enrollParticipant:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Add finding to audit (HSE002)
 */
const addFinding = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, severity, description, evidence, nonconformity, requiredAction } = req.body;
    
    const audit = await HSEAudit.findByPk(id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit non trouvé' });
    }
    
    const finding = {
      id: Date.now().toString(),
      category,
      severity,
      description,
      evidence: evidence || [],
      nonconformity: nonconformity || false,
      requiredAction,
      createdAt: new Date()
    };
    
    if (!audit.findings) {
      audit.findings = [];
    }
    audit.findings.push(finding);
    await audit.save();
    
    res.json({ success: true, data: audit });
  } catch (error) {
    logger.error('Erreur addFinding:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Close finding (HSE002)
 */
const closeFinding = async (req, res) => {
  try {
    const { id, findingId } = req.params;
    const { evidenceOfCorrection } = req.body;
    
    const audit = await HSEAudit.findByPk(id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit non trouvé' });
    }
    
    const finding = audit.findings.find(f => f.id === findingId);
    if (!finding) {
      return res.status(404).json({ success: false, message: 'Constat non trouvé' });
    }
    
    finding.status = 'closed';
    finding.closedDate = new Date();
    finding.evidenceOfCorrection = evidenceOfCorrection || [];
    
    await audit.save();
    
    res.json({ success: true, data: audit });
  } catch (error) {
    logger.error('Erreur closeFinding:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getIncidents,
  createIncident,
  approveIncident,
  escalateIncident,
  updateIncidentStatus,
  addCorrectiveAction,
  closeIncident,
  getTrainings,
  createTraining,
  enrollParticipant,
  getAudits,
  createAudit,
  addFinding,
  closeFinding,
  generateAuditReport,
  getHSEStats
};