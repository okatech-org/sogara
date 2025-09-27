const Joi = require('joi');

// Schémas de validation réutilisables
const schemas = {
  // Validation matricule SOGARA (format: XXX000)
  matricule: Joi.string()
    .pattern(/^[A-Z]{3}\d{3}$/)
    .message('Le matricule doit suivre le format XXX000 (3 lettres majuscules + 3 chiffres)'),
    
  // Validation email
  email: Joi.string().email().message('Adresse email invalide'),
  
  // Validation téléphone
  phone: Joi.string()
    .pattern(/^[0-9+\-() ]+$/)
    .min(8)
    .max(20)
    .message('Numéro de téléphone invalide'),
    
  // Validation mot de passe
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'),
    
  // Validation ObjectId MongoDB ou UUID PostgreSQL
  id: Joi.alternatives().try(
    Joi.string().uuid(),
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
  ).message('ID invalide'),
  
  // Validation date
  date: Joi.date().iso().message('Date invalide (format ISO requis)'),
  
  // Validation statut
  status: Joi.string().valid('active', 'inactive').message('Statut invalide'),
  
  // Validation rôles SOGARA
  role: Joi.string().valid('ADMIN', 'HSE', 'SUPERVISEUR', 'RECEP', 'EMPLOYE', 'COMMUNICATION'),
  
  // Validation priorité
  priority: Joi.string().valid('normal', 'urgent'),
  
  // Validation type de fichier
  fileType: Joi.string().valid('image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
};

// Schémas de validation pour les entités

// Employé
const employeeSchema = {
  create: Joi.object({
    firstName: Joi.string().min(2).max(50).required().message('Prénom requis (2-50 caractères)'),
    lastName: Joi.string().min(2).max(50).required().message('Nom requis (2-50 caractères)'),
    matricule: schemas.matricule.required(),
    service: Joi.string().min(2).max(100).required().message('Service requis'),
    roles: Joi.array().items(schemas.role).min(1).required().message('Au moins un rôle requis'),
    competences: Joi.array().items(Joi.string().max(100)).default([]),
    habilitations: Joi.array().items(Joi.string().max(100)).default([]),
    email: schemas.email.optional(),
    phone: schemas.phone.optional(),
    status: schemas.status.default('active')
  }),
  
  update: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    matricule: schemas.matricule,
    service: Joi.string().min(2).max(100),
    roles: Joi.array().items(schemas.role).min(1),
    competences: Joi.array().items(Joi.string().max(100)),
    habilitations: Joi.array().items(Joi.string().max(100)),
    email: schemas.email,
    phone: schemas.phone,
    status: schemas.status
  }).min(1)
};

// Visiteur
const visitorSchema = {
  create: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    company: Joi.string().min(2).max(100).required(),
    idDocument: Joi.string().min(5).max(50).required(),
    documentType: Joi.string().valid('cin', 'passport', 'other').required(),
    phone: schemas.phone.optional(),
    email: schemas.email.optional(),
    photo: Joi.string().uri().optional()
  })
};

// Visite
const visitSchema = {
  create: Joi.object({
    visitorId: schemas.id.required(),
    hostEmployeeId: schemas.id.required(),
    scheduledAt: schemas.date.required(),
    purpose: Joi.string().min(5).max(500).required(),
    notes: Joi.string().max(1000).optional(),
    badgeNumber: Joi.string().max(20).optional()
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('expected', 'waiting', 'in_progress', 'checked_out').required(),
    badgeNumber: Joi.string().max(20).optional(),
    notes: Joi.string().max(1000).optional()
  })
};

// Colis/Courrier
const packageSchema = {
  create: Joi.object({
    type: Joi.string().valid('package', 'mail').required(),
    reference: Joi.string().min(3).max(50).required(),
    sender: Joi.string().min(2).max(100).required(),
    recipientEmployeeId: schemas.id.required(),
    description: Joi.string().min(5).max(500).required(),
    priority: schemas.priority.default('normal'),
    photoUrl: Joi.string().uri().optional()
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('received', 'stored', 'delivered').required(),
    deliveredBy: Joi.string().min(2).max(100).optional(),
    signature: Joi.string().optional()
  })
};

// Équipement
const equipmentSchema = {
  create: Joi.object({
    type: Joi.string().min(2).max(50).required(),
    label: Joi.string().min(2).max(100).required(),
    serialNumber: Joi.string().max(50).optional(),
    status: Joi.string().valid('operational', 'maintenance', 'out_of_service').default('operational'),
    nextCheckDate: schemas.date.optional(),
    description: Joi.string().max(500).optional(),
    location: Joi.string().max(100).optional()
  }),
  
  assign: Joi.object({
    employeeId: schemas.id.required()
  })
};

// Incident HSE
const hseIncidentSchema = {
  create: Joi.object({
    employeeId: schemas.id.required(),
    type: Joi.string().min(5).max(100).required(),
    severity: Joi.string().valid('low', 'medium', 'high').required(),
    description: Joi.string().min(10).max(2000).required(),
    location: Joi.string().min(5).max(200).required(),
    occurredAt: schemas.date.required(),
    reportedBy: schemas.id.required(),
    attachments: Joi.array().items(Joi.string().uri()).optional()
  }),
  
  update: Joi.object({
    status: Joi.string().valid('reported', 'investigating', 'resolved').required(),
    resolution: Joi.string().max(1000).optional(),
    investigator: schemas.id.optional()
  })
};

// Formation HSE
const hseTrainingSchema = {
  create: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    requiredForRoles: Joi.array().items(schemas.role).min(1).required(),
    duration: Joi.number().integer().min(1).max(480).required(), // en minutes
    validityMonths: Joi.number().integer().min(1).max(60).required()
  }),
  
  session: Joi.object({
    trainingId: schemas.id.required(),
    date: schemas.date.required(),
    instructor: Joi.string().min(5).max(100).required(),
    location: Joi.string().min(5).max(200).required(),
    maxParticipants: Joi.number().integer().min(1).max(100).required()
  })
};

// Post/Article
const postSchema = {
  create: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    content: Joi.string().min(50).required(),
    excerpt: Joi.string().min(20).max(500).required(),
    authorId: schemas.id.required(),
    category: Joi.string().valid('news', 'activity', 'announcement', 'event').required(),
    featuredImage: Joi.string().uri().optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    videoUrl: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft')
  })
};

// Authentification
const authSchema = {
  login: Joi.object({
    matricule: schemas.matricule.required(),
    password: Joi.string().min(1).required().message('Mot de passe requis')
  }),
  
  register: Joi.object({
    ...employeeSchema.create.describe().keys,
    password: schemas.password.required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().message('Les mots de passe ne correspondent pas')
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: schemas.password.required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

// Fonction de validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errorMessages
      });
    }
    
    req.validatedData = value;
    next();
  };
};

// Validation des paramètres d'URL
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        error: error.details[0].message
      });
    }
    
    req.validatedParams = value;
    next();
  };
};

// Validation des query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres de requête invalides',
        error: error.details[0].message
      });
    }
    
    req.validatedQuery = value;
    next();
  };
};

module.exports = {
  schemas,
  employeeSchema,
  visitorSchema,
  visitSchema,
  packageSchema,
  equipmentSchema,
  hseIncidentSchema,
  hseTrainingSchema,
  postSchema,
  authSchema,
  validate,
  validateParams,
  validateQuery
};
