const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
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
} = require('../controllers/hse.controller');

// Import des middlewares
const { requirePermissions } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/hse/incidents
 * @desc    Obtenir tous les incidents HSE
 * @access  Private (Admin, HSE)
 */
router.get('/incidents', 
  requirePermissions('read:hse'),
  getIncidents
);

/**
 * @route   POST /api/hse/incidents
 * @desc    Créer un nouvel incident HSE
 * @access  Private (Admin, HSE, Employee)
 */
router.post('/incidents',
  requirePermissions('write:hse'),
  createIncident
);

/**
 * @route   POST /api/hse/incidents/:id/approve
 * @desc    Approuver un incident (HSE002 ou HSE001)
 * @access  Private (HSE_MANAGER, HSSE_CHIEF)
 */
router.post('/incidents/:id/approve',
  requirePermissions('write:hse'),
  approveIncident
);

/**
 * @route   POST /api/hse/incidents/:id/escalate
 * @desc    Escalader un incident vers HSE001 (HSE002 only)
 * @access  Private (HSE_MANAGER)
 */
router.post('/incidents/:id/escalate',
  requirePermissions('write:hse'),
  escalateIncident
);

/**
 * @route   PUT /api/hse/incidents/:id/status
 * @desc    Mettre à jour le statut d'un incident
 * @access  Private (Admin, HSE)
 */
router.put('/incidents/:id/status',
  requirePermissions('write:hse'),
  updateIncidentStatus
);

/**
 * @route   GET /api/hse/trainings
 * @desc    Obtenir toutes les formations HSE
 * @access  Private (Admin, HSE)
 */
router.get('/trainings',
  requirePermissions('read:hse'),
  getTrainings
);

/**
 * @route   POST /api/hse/trainings
 * @desc    Créer une nouvelle formation HSE
 * @access  Private (Admin, HSE)
 */
router.post('/trainings',
  requirePermissions('write:hse'),
  createTraining
);

/**
 * @route   GET /api/hse/audits
 * @desc    Obtenir tous les audits HSE
 * @access  Private (HSE_MANAGER, HSSE_CHIEF, Admin)
 */
router.get('/audits',
  requirePermissions('read:hse'),
  getAudits
);

/**
 * @route   POST /api/hse/audits
 * @desc    Créer un nouvel audit HSE
 * @access  Private (HSE_MANAGER, HSSE_CHIEF, Admin)
 */
router.post('/audits',
  requirePermissions('write:hse'),
  createAudit
);

/**
 * @route   POST /api/hse/audits/:id/generate-report
 * @desc    Générer un rapport d'audit
 * @access  Private (HSE_MANAGER, HSSE_CHIEF)
 */
router.post('/audits/:id/generate-report',
  requirePermissions('write:hse'),
  generateAuditReport
);

/**
 * @route   POST /api/hse/incidents/:id/corrective-actions
 * @desc    Ajouter une action corrective à un incident
 * @access  Private (HSE_MANAGER, HSSE_CHIEF)
 */
router.post('/incidents/:id/corrective-actions',
  requirePermissions('write:hse'),
  addCorrectiveAction
);

/**
 * @route   POST /api/hse/incidents/:id/close
 * @desc    Fermer un incident
 * @access  Private (HSE_MANAGER, HSSE_CHIEF)
 */
router.post('/incidents/:id/close',
  requirePermissions('write:hse'),
  closeIncident
);

/**
 * @route   POST /api/hse/trainings/:id/enroll/:employeeId
 * @desc    Inscrire un employé à une formation
 * @access  Private (HSE_MANAGER, HSSE_CHIEF)
 */
router.post('/trainings/:id/enroll/:employeeId',
  requirePermissions('write:hse'),
  enrollParticipant
);

/**
 * @route   POST /api/hse/audits/:id/findings
 * @desc    Ajouter un constat à un audit
 * @access  Private (HSE_MANAGER, HSSE_CHIEF)
 */
router.post('/audits/:id/findings',
  requirePermissions('write:hse'),
  addFinding
);

/**
 * @route   POST /api/hse/audits/:id/findings/:findingId/close
 * @desc    Fermer un constat d'audit
 * @access  Private (HSE_MANAGER, HSSE_CHIEF)
 */
router.post('/audits/:id/findings/:findingId/close',
  requirePermissions('write:hse'),
  closeFinding
);

/**
 * @route   GET /api/hse/stats/overview
 * @desc    Obtenir les statistiques HSE
 * @access  Private (Admin, HSE)
 */
router.get('/stats/overview',
  requirePermissions('read:hse'),
  getHSEStats
);

module.exports = router;