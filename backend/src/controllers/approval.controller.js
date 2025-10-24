const ApprovalWorkflow = require('../models/ApprovalWorkflow.model');
const ApprovalStep = require('../models/ApprovalStep.model');
const Employee = require('../models/Employee.model');
const { Op } = require('sequelize');

class ApprovalController {
  // Créer un nouveau workflow d'approbation
  async createWorkflow(req, res) {
    try {
      const { type, title, description, priority, workflowData, approvers } = req.body;
      
      const workflow = await ApprovalWorkflow.create({
        type,
        title,
        description,
        priority,
        requesterId: req.user.id,
        workflowData,
        totalSteps: approvers.length
      });

      // Créer les étapes d'approbation
      const steps = await Promise.all(
        approvers.map((approver, index) => 
          ApprovalStep.create({
            workflowId: workflow.id,
            stepNumber: index + 1,
            stepName: approver.stepName || `Étape ${index + 1}`,
            approverId: approver.approverId,
            dueDate: approver.dueDate,
            isRequired: approver.isRequired !== false,
            canDelegate: approver.canDelegate || false
          })
        )
      );

      // Définir le premier approbateur comme approbateur actuel
      await workflow.update({
        approverId: steps[0].approverId
      });

      res.status(201).json({
        success: true,
        data: {
          workflow,
          steps
        },
        message: 'Workflow d\'approbation créé avec succès'
      });
    } catch (error) {
      console.error('Erreur création workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du workflow',
        error: error.message
      });
    }
  }

  // Récupérer les workflows d'approbation
  async getWorkflows(req, res) {
    try {
      const { status, type, priority } = req.query;
      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }
      if (type) {
        whereClause.type = type;
      }
      if (priority) {
        whereClause.priority = priority;
      }

      const workflows = await ApprovalWorkflow.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            as: 'requester',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Employee,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      console.error('Erreur récupération workflows:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des workflows',
        error: error.message
      });
    }
  }

  // Récupérer les workflows en attente d'approbation pour un utilisateur
  async getPendingApprovals(req, res) {
    try {
      const userId = req.user.id;

      const pendingSteps = await ApprovalStep.findAll({
        where: {
          approverId: userId,
          status: 'pending'
        },
        include: [
          {
            model: ApprovalWorkflow,
            include: [
              {
                model: Employee,
                as: 'requester',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      res.json({
        success: true,
        data: pendingSteps
      });
    } catch (error) {
      console.error('Erreur récupération approbations en attente:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des approbations en attente',
        error: error.message
      });
    }
  }

  // Approuver une étape
  async approveStep(req, res) {
    try {
      const { stepId } = req.params;
      const { comments, decision } = req.body;

      const step = await ApprovalStep.findByPk(stepId, {
        include: [ApprovalWorkflow]
      });

      if (!step) {
        return res.status(404).json({
          success: false,
          message: 'Étape d\'approbation non trouvée'
        });
      }

      if (step.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cette étape a déjà été traitée'
        });
      }

      // Mettre à jour l'étape
      await step.update({
        status: decision,
        comments,
        approvedAt: new Date()
      });

      // Ajouter à l'historique
      const historyEntry = {
        stepId: step.id,
        approverId: req.user.id,
        decision,
        comments,
        timestamp: new Date()
      };

      const workflow = step.ApprovalWorkflow;
      const approvalHistory = workflow.approvalHistory || [];
      approvalHistory.push(historyEntry);

      await workflow.update({
        approvalHistory
      });

      // Vérifier si c'est la dernière étape
      if (step.stepNumber === workflow.totalSteps) {
        await workflow.update({
          status: decision === 'approved' ? 'approved' : 'rejected',
          completedAt: new Date()
        });
      } else {
        // Passer à l'étape suivante
        const nextStep = await ApprovalStep.findOne({
          where: {
            workflowId: workflow.id,
            stepNumber: step.stepNumber + 1
          }
        });

        if (nextStep) {
          await workflow.update({
            currentStep: nextStep.stepNumber,
            approverId: nextStep.approverId
          });
        }
      }

      res.json({
        success: true,
        message: `Étape ${decision === 'approved' ? 'approuvée' : 'rejetée'} avec succès`
      });
    } catch (error) {
      console.error('Erreur approbation étape:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'approbation de l\'étape',
        error: error.message
      });
    }
  }

  // Déléguer une approbation
  async delegateApproval(req, res) {
    try {
      const { stepId } = req.params;
      const { delegateToId, reason } = req.body;

      const step = await ApprovalStep.findByPk(stepId);

      if (!step) {
        return res.status(404).json({
          success: false,
          message: 'Étape d\'approbation non trouvée'
        });
      }

      if (!step.canDelegate) {
        return res.status(400).json({
          success: false,
          message: 'Cette étape ne peut pas être déléguée'
        });
      }

      await step.update({
        approverId: delegateToId,
        comments: `Délégation: ${reason}`
      });

      res.json({
        success: true,
        message: 'Approbation déléguée avec succès'
      });
    } catch (error) {
      console.error('Erreur délégation approbation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la délégation de l\'approbation',
        error: error.message
      });
    }
  }

  // Récupérer l'historique d'un workflow
  async getWorkflowHistory(req, res) {
    try {
      const { workflowId } = req.params;

      const workflow = await ApprovalWorkflow.findByPk(workflowId, {
        include: [
          {
            model: Employee,
            as: 'requester',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Employee,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: 'Workflow non trouvé'
        });
      }

      const steps = await ApprovalStep.findAll({
        where: { workflowId },
        include: [
          {
            model: Employee,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['stepNumber', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          workflow,
          steps,
          history: workflow.approvalHistory || []
        }
      });
    } catch (error) {
      console.error('Erreur récupération historique workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique',
        error: error.message
      });
    }
  }

  // Créer un workflow HSE spécifique
  async createHSEWorkflow(req, res) {
    try {
      const { incidentId, type, title, description, priority } = req.body;

      // Workflow HSE standard
      const hseApprovers = [
        {
          stepName: 'Validation Superviseur HSE',
          approverId: req.body.supervisorId,
          isRequired: true,
          canDelegate: true
        },
        {
          stepName: 'Validation Responsable HSE',
          approverId: req.body.hseManagerId,
          isRequired: true,
          canDelegate: false
        },
        {
          stepName: 'Validation Direction',
          approverId: req.body.directorId,
          isRequired: priority === 'urgent' || priority === 'high',
          canDelegate: true
        }
      ];

      const workflow = await ApprovalWorkflow.create({
        type: 'hse_incident',
        title,
        description,
        priority,
        requesterId: req.user.id,
        workflowData: {
          incidentId,
          type,
          hseSpecific: true
        },
        totalSteps: hseApprovers.length
      });

      // Créer les étapes HSE
      const steps = await Promise.all(
        hseApprovers.map((approver, index) => 
          ApprovalStep.create({
            workflowId: workflow.id,
            stepNumber: index + 1,
            stepName: approver.stepName,
            approverId: approver.approverId,
            isRequired: approver.isRequired,
            canDelegate: approver.canDelegate,
            dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000) // 1 jour par étape
          })
        )
      );

      res.status(201).json({
        success: true,
        data: {
          workflow,
          steps
        },
        message: 'Workflow HSE créé avec succès'
      });
    } catch (error) {
      console.error('Erreur création workflow HSE:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du workflow HSE',
        error: error.message
      });
    }
  }
}

module.exports = new ApprovalController();
