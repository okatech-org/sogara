const { Equipment, Employee, EquipmentHistory } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Obtenir tous les équipements avec filtres
 */
const getEquipment = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type,
      assignedTo,
      location 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (assignedTo) where.assignedTo = assignedTo;

    const { count, rows: equipment } = await Equipment.findAndCountAll({
      where,
      include: [
        { 
          model: Employee, 
          as: 'assignedEmployee', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: equipment,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erreur getEquipment:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Obtenir un équipement par ID
 */
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const equipment = await Equipment.findByPk(id, {
      include: [
        { 
          model: Employee, 
          as: 'assignedEmployee', 
          attributes: ['id', 'firstName', 'lastName', 'matricule', 'service'] 
        },
        {
          model: EquipmentHistory,
          as: 'history',
          include: [
            {
              model: Employee,
              as: 'employee',
              attributes: ['id', 'firstName', 'lastName', 'matricule']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Équipement non trouvé' });
    }

    res.json({ success: true, data: equipment });
  } catch (error) {
    logger.error('Erreur getEquipmentById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Créer un nouvel équipement
 */
const createEquipment = async (req, res) => {
  try {
    const equipmentData = req.body;
    
    const equipment = await Equipment.create(equipmentData);
    
    // Créer l'entrée d'historique
    await EquipmentHistory.create({
      equipmentId: equipment.id,
      action: 'created',
      description: 'Équipement créé',
      employeeId: req.user.userId
    });

    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('equipment_created', {
        type: 'equipment_created',
        data: equipment,
        message: 'Nouvel équipement enregistré'
      });
    }

    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    logger.error('Erreur createEquipment:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Assigner un équipement à un employé
 */
const assignEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, notes } = req.body;
    
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Équipement non trouvé' });
    }

    const previousAssignee = equipment.assignedTo;
    equipment.assignedTo = employeeId;
    equipment.status = 'assigned';
    equipment.assignedAt = new Date();
    
    await equipment.save();

    // Créer l'entrée d'historique
    await EquipmentHistory.create({
      equipmentId: equipment.id,
      action: 'assigned',
      description: `Assigné à l'employé ${employeeId}`,
      employeeId: req.user.userId,
      notes
    });

    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('equipment_assigned', {
        type: 'equipment_assigned',
        data: equipment,
        message: 'Équipement assigné'
      });
    }

    res.json({ success: true, data: equipment });
  } catch (error) {
    logger.error('Erreur assignEquipment:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Retourner un équipement
 */
const returnEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, condition } = req.body;
    
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Équipement non trouvé' });
    }

    equipment.assignedTo = null;
    equipment.status = 'available';
    equipment.returnedAt = new Date();
    if (condition) equipment.condition = condition;
    
    await equipment.save();

    // Créer l'entrée d'historique
    await EquipmentHistory.create({
      equipmentId: equipment.id,
      action: 'returned',
      description: 'Équipement retourné',
      employeeId: req.user.userId,
      notes
    });

    // Notifier via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('equipment_returned', {
        type: 'equipment_returned',
        data: equipment,
        message: 'Équipement retourné'
      });
    }

    res.json({ success: true, data: equipment });
  } catch (error) {
    logger.error('Erreur returnEquipment:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Statistiques des équipements
 */
const getEquipmentStats = async (req, res) => {
  try {
    const totalEquipment = await Equipment.count();
    const availableEquipment = await Equipment.count({
      where: { status: 'available' }
    });
    const assignedEquipment = await Equipment.count({
      where: { status: 'assigned' }
    });
    const maintenanceEquipment = await Equipment.count({
      where: { status: 'maintenance' }
    });

    res.json({
      success: true,
      data: {
        totalEquipment,
        availableEquipment,
        assignedEquipment,
        maintenanceEquipment,
        utilizationRate: totalEquipment > 0 ? (assignedEquipment / totalEquipment * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    logger.error('Erreur getEquipmentStats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  assignEquipment,
  returnEquipment,
  getEquipmentStats
};