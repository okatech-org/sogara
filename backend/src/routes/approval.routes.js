const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Routes workflows d'approbation
router.post('/workflow', requireRole(['ADMIN', 'HSE', 'SUPERVISEUR']), approvalController.createWorkflow);
router.get('/workflows', requireRole(['ADMIN', 'HSE', 'SUPERVISEUR']), approvalController.getWorkflows);
router.get('/pending', requireRole(['ADMIN', 'HSE', 'SUPERVISEUR']), approvalController.getPendingApprovals);
router.post('/step/:stepId/approve', requireRole(['ADMIN', 'HSE', 'SUPERVISEUR']), approvalController.approveStep);
router.post('/step/:stepId/delegate', requireRole(['ADMIN', 'HSE', 'SUPERVISEUR']), approvalController.delegateApproval);
router.get('/workflow/:workflowId/history', requireRole(['ADMIN', 'HSE', 'SUPERVISEUR']), approvalController.getWorkflowHistory);

// Routes spécifiques HSE
router.post('/hse-workflow', requireRole(['ADMIN', 'HSE']), approvalController.createHSEWorkflow);

module.exports = router;
