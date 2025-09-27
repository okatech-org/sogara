const Employee = require('../models/Employee.model');
const logger = require('../utils/logger');
const { employeeSchema } = require('../utils/validators');
const { Op } = require('sequelize');

/**
 * Obtenir tous les employés avec pagination et filtres
 * GET /api/employees
 */
const getEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      service = '',
      role = '',
      status = 'active',
      sortBy = 'lastName',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Construction des filtres
    const whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (service) {
      whereClause.service = service;
    }
    
    if (role) {
      whereClause.roles = {
        [Op.contains]: [role]
      };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { matricule: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Exécution de la requête avec comptage
    const { count, rows: employees } = await Employee.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      message: 'Employés récupérés',
      data: {
        employees,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Erreur récupération employés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Obtenir un employé par ID
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Employé récupéré',
      data: {
        employee
      }
    });

  } catch (error) {
    logger.error('Erreur récupération employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Créer un nouvel employé
 * POST /api/employees
 */
const createEmployee = async (req, res) => {
  try {
    const { error, value } = employeeSchema.create.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Vérifier l'unicité du matricule
    const existingEmployee = await Employee.findByMatricule(value.matricule);
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: 'Ce matricule existe déjà'
      });
    }

    // Vérifier l'unicité de l'email si fourni
    if (value.email) {
      const existingEmail = await Employee.findOne({ where: { email: value.email } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Cette adresse email est déjà utilisée'
        });
      }
    }

    const employee = await Employee.create({
      ...value,
      stats: {
        visitsReceived: 0,
        packagesReceived: 0,
        hseTrainingsCompleted: 0
      }
    });

    logger.info(`Employé créé: ${employee.matricule} par ${req.user.matricule}`);

    res.status(201).json({
      success: true,
      message: 'Employé créé avec succès',
      data: {
        employee: employee.toSafeJSON()
      }
    });

  } catch (error) {
    logger.error('Erreur création employé:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Mettre à jour un employé
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = employeeSchema.update.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    // Vérifier l'unicité du matricule si modifié
    if (value.matricule && value.matricule !== employee.matricule) {
      const existingEmployee = await Employee.findByMatricule(value.matricule);
      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: 'Ce matricule existe déjà'
        });
      }
    }

    // Vérifier l'unicité de l'email si modifié
    if (value.email && value.email !== employee.email) {
      const existingEmail = await Employee.findOne({ where: { email: value.email } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Cette adresse email est déjà utilisée'
        });
      }
    }

    await employee.update(value);

    logger.info(`Employé mis à jour: ${employee.matricule} par ${req.user.matricule}`);

    res.json({
      success: true,
      message: 'Employé mis à jour avec succès',
      data: {
        employee: employee.toSafeJSON()
      }
    });

  } catch (error) {
    logger.error('Erreur mise à jour employé:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Supprimer un employé
 * DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    // Empêcher la suppression de son propre compte
    if (employee.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    // Marquer comme inactif au lieu de supprimer
    await employee.update({ status: 'inactive' });

    logger.info(`Employé désactivé: ${employee.matricule} par ${req.user.matricule}`);

    res.json({
      success: true,
      message: 'Employé désactivé avec succès'
    });

  } catch (error) {
    logger.error('Erreur suppression employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Obtenir les employés par rôle
 * GET /api/employees/by-role/:role
 */
const getEmployeesByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const validRoles = ['ADMIN', 'HSE', 'SUPERVISEUR', 'RECEP', 'EMPLOYE', 'COMMUNICATION'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    const employees = await Employee.findByRole(role);

    res.json({
      success: true,
      message: `Employés avec le rôle ${role}`,
      data: {
        employees: employees.map(emp => emp.toSafeJSON()),
        count: employees.length
      }
    });

  } catch (error) {
    logger.error('Erreur récupération employés par rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Obtenir les statistiques des employés
 * GET /api/employees/stats
 */
const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.count({ where: { status: 'active' } });
    
    const employeesByService = await Employee.findAll({
      where: { status: 'active' },
      attributes: ['service'],
      group: ['service'],
      raw: true
    });

    const employeesByRole = await Employee.findAll({
      where: { status: 'active' },
      attributes: ['roles'],
      raw: true
    });

    // Compter les rôles
    const roleCount = {};
    employeesByRole.forEach(emp => {
      emp.roles.forEach(role => {
        roleCount[role] = (roleCount[role] || 0) + 1;
      });
    });

    // Compter les services
    const serviceCount = {};
    employeesByService.forEach(emp => {
      serviceCount[emp.service] = (serviceCount[emp.service] || 0) + 1;
    });

    res.json({
      success: true,
      message: 'Statistiques des employés',
      data: {
        totalEmployees,
        employeesByService: serviceCount,
        employeesByRole: roleCount,
        activeEmployees: totalEmployees,
        inactiveEmployees: await Employee.count({ where: { status: 'inactive' } })
      }
    });

  } catch (error) {
    logger.error('Erreur récupération stats employés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Upload photo de profil
 * POST /api/employees/:id/photo
 */
const uploadProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    // Vérifier que l'utilisateur peut modifier cette photo
    if (employee.id !== req.user.id && !req.user.roles.includes('ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }

    if (!req.uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadé'
      });
    }

    // Mettre à jour le chemin de la photo
    await employee.update({ photo: req.uploadedFile.url });

    logger.info(`Photo mise à jour pour: ${employee.matricule}`);

    res.json({
      success: true,
      message: 'Photo de profil mise à jour',
      data: {
        photoUrl: req.uploadedFile.url
      }
    });

  } catch (error) {
    logger.error('Erreur upload photo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByRole,
  getEmployeeStats,
  uploadProfilePhoto
};
