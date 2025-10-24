# 🛠️ GUIDE D'IMPLÉMENTATION TECHNIQUE - RESTRUCTURATION HSE/COMPLIANCE

**Classification**: Technical Implementation
**Priority**: 🔴 CRITICAL - Phase 1: Planning
**Audience**: Backend Developers, DevOps, Database Architects

---

## 📋 TABLE DES MATIÈRES

1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)
3. [Database Schema](#database-schema)
4. [Permission Engine](#permission-engine)
5. [Audit Logging](#audit-logging)
6. [Workflow Implementation](#workflow-implementation)
7. [Testing Strategy](#testing-strategy)

---

## 🔧 BACKEND IMPLEMENTATION

### 1. Backend Architecture Updates

```
backend/src/
├── controllers/
│   ├── hse.controller.js       (EXISTING - MODIFY)
│   ├── compliance.controller.js (NEW - CREATE)
│   ├── security.controller.js   (NEW - CREATE)
│   └── incidents.controller.js  (NEW - SPLIT FROM HSE)
│
├── middleware/
│   ├── auth.middleware.js       (EXISTING - UPDATE)
│   ├── permissions.middleware.js (NEW - CREATE)
│   └── audit.middleware.js      (NEW - CREATE)
│
├── services/
│   ├── incident.service.js      (NEW - CREATE)
│   ├── compliance.service.js    (NEW - CREATE)
│   ├── training.service.js      (EXISTING - UPDATE)
│   ├── audit.service.js         (NEW - CREATE)
│   ├── permission.service.js    (NEW - CREATE)
│   └── notification.service.js  (EXISTING - UPDATE)
│
├── models/
│   ├── User.model.js            (EXISTING - UPDATE)
│   ├── HSEIncident.model.js     (EXISTING - UPDATE)
│   ├── HSETraining.model.js     (EXISTING - UPDATE)
│   ├── HSEAudit.model.js        (EXISTING - UPDATE)
│   ├── ComplianceAudit.model.js (NEW - CREATE)
│   ├── ComplianceReport.model.js (NEW - CREATE)
│   ├── AuditLog.model.js        (NEW - CREATE)
│   ├── Permission.model.js      (NEW - CREATE)
│   └── Hierarchy.model.js       (NEW - CREATE)
│
├── routes/
│   ├── hse.routes.js            (EXISTING - MODIFY)
│   ├── incidents.routes.js      (NEW - CREATE)
│   ├── compliance.routes.js     (NEW - CREATE)
│   ├── security.routes.js       (NEW - CREATE)
│   └── audits.routes.js         (NEW - CREATE)
│
└── utils/
    ├── permissions.utils.js     (NEW - CREATE)
    ├── rbac.utils.js            (NEW - CREATE)
    └── audit.utils.js           (NEW - CREATE)
```

### 2. User Model Updates

```javascript
// backend/src/models/User.model.js - ADD FIELDS

const userSchema = new Schema({
  // Existing fields
  firstName: String,
  lastName: String,
  email: String,
  matricule: String,
  roles: [String],  // ['HSE_MANAGER', 'HSSE_CHIEF', 'COMPLIANCE_CHIEF', 'SECURITY_MANAGER']
  
  // NEW: Hierarchical Information
  department: {
    type: String,
    enum: ['HSE', 'COMPLIANCE', 'OPERATIONS', 'SECURITY', 'ADMIN'],
    default: 'OPERATIONS'
  },
  
  roleLevel: {
    type: Number,  // 0-5, where 5 = executive
    default: 1
  },
  
  reportsTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // User ID of supervisor
    required: false
  },
  
  managedBy: {
    type: String,  // Role ID (e.g., 'HSE002')
    required: false
  },
  
  supervises: [{
    type: Schema.Types.ObjectId,
    ref: 'User'   // User IDs supervised
  }],
  
  // NEW: Permission Tracking
  customPermissions: [{
    permission: String,
    grantedAt: Date,
    grantedBy: Schema.Types.ObjectId,
    expiresAt: Date,
    context: Schema.Types.Mixed
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 3. Hierarchy Model (NEW)

```javascript
// backend/src/models/Hierarchy.model.js - NEW FILE

const hierarchySchema = new Schema({
  id: String,  // 'HSE001', 'HSE002', 'CONF001', 'REC001'
  
  title: String,  // 'Chief of HSSE and Compliance Division'
  department: String,  // 'HSE', 'COMPLIANCE', 'OPERATIONS'
  level: Number,  // 0-5
  
  reportsTo: String,  // Hierarchy ID
  supervises: [String],  // Array of hierarchy IDs
  
  responsibilities: [String],
  
  permissions: {
    modules: [String],
    actions: [String],
    resources: Schema.Types.Mixed  // Context-specific
  },
  
  constraints: {
    canModifyOwn: Boolean,
    canModifyOthers: Boolean,
    canApprove: [String],  // Approval levels
    canEscalate: Boolean,
    restrictedAccess: [String]  // Data they cannot access
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hierarchy', hierarchySchema);
```

### 4. Permission Model (NEW)

```javascript
// backend/src/models/Permission.model.js - NEW FILE

const permissionSchema = new Schema({
  permissionId: String,  // e.g., 'ACT_APPROVE_LOW_INCIDENT'
  module: String,        // e.g., 'MOD_HSE_INCIDENTS'
  action: String,        // e.g., 'APPROVE'
  resource: String,      // e.g., 'INCIDENT'
  
  description: String,
  
  // Role associations
  grantedToRoles: [String],  // Roles that have this permission
  
  // Context rules
  contextRules: {
    severity: [String],    // For incidents: LOW, MEDIUM, HIGH, CRITICAL
    ownership: String,     // 'OWN_ONLY', 'OWN_AND_TEAM', 'ALL'
    resourceType: [String],
    conditions: Schema.Types.Mixed
  },
  
  // Segregation of duties
  conflictsWith: [String],  // Permission IDs that conflict
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Permission', permissionSchema);
```

### 5. Audit Log Model (NEW)

```javascript
// backend/src/models/AuditLog.model.js - NEW FILE

const auditLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  action: String,        // 'CREATE_INCIDENT', 'APPROVE_INCIDENT', etc.
  resource: {
    type: String,        // 'INCIDENT', 'TRAINING', 'AUDIT'
    required: true
  },
  resourceId: Schema.Types.ObjectId,
  
  changes: Schema.Types.Mixed,  // Before/after values
  
  result: {
    type: String,
    enum: ['ALLOWED', 'DENIED', 'ESCALATED'],
    default: 'ALLOWED'
  },
  
  denialReason: String,  // Why was it denied?
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    durationMs: Number  // How long did the action take?
  },
  
  segregationOfDutiesCheck: {
    conflictDetected: Boolean,
    conflictWith: String,  // Permission that conflicts
    resolved: Boolean
  },
  
  createdAt: { type: Date, default: Date.now, index: true }
});

// Indexes for fast auditing
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resourceId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, result: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

---

## 🔐 PERMISSION ENGINE

### 6. Permission Service

```javascript
// backend/src/services/permission.service.js - NEW FILE

const Permission = require('../models/Permission.model.js');
const Hierarchy = require('../models/Hierarchy.model.js');
const AuditLog = require('../models/AuditLog.model.js');

class PermissionService {
  /**
   * Check if user can perform an action on a resource
   */
  async canPerformAction(userId, action, resource, resourceId, context = {}) {
    const auditEntry = {
      userId,
      action,
      resource,
      resourceId,
      result: 'PENDING'
    };

    try {
      // 1. Get user and their hierarchy
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 2. Get hierarchy info
      const hierarchyId = this.getRoleHierarchyId(user.roles);
      const hierarchy = await Hierarchy.findOne({ id: hierarchyId });

      // 3. Check role-based permissions
      const rolePermissions = await Permission.find({
        grantedToRoles: { $in: user.roles }
      });

      // 4. Check if action is in role permissions
      const hasPermission = rolePermissions.some(p =>
        p.action === action && p.resource === resource
      );

      if (!hasPermission) {
        auditEntry.result = 'DENIED';
        auditEntry.denialReason = 'Role does not have permission';
        await this.logAudit(auditEntry);
        return {
          allowed: false,
          reason: 'Permission denied by role'
        };
      }

      // 5. Check context-based rules
      const contextCheckResult = await this.checkContextRules(
        userId,
        action,
        resource,
        resourceId,
        context,
        rolePermissions
      );

      if (!contextCheckResult.allowed) {
        auditEntry.result = 'DENIED';
        auditEntry.denialReason = contextCheckResult.reason;
        await this.logAudit(auditEntry);
        return contextCheckResult;
      }

      // 6. Check segregation of duties
      const sodCheckResult = await this.checkSegregationOfDuties(
        userId,
        action,
        resource,
        context
      );

      if (!sodCheckResult.allowed) {
        auditEntry.result = 'DENIED';
        auditEntry.denialReason = sodCheckResult.reason;
        auditEntry.segregationOfDutiesCheck = {
          conflictDetected: true,
          conflictWith: sodCheckResult.conflictWith
        };
        await this.logAudit(auditEntry);
        return sodCheckResult;
      }

      // 7. All checks passed
      auditEntry.result = 'ALLOWED';
      await this.logAudit(auditEntry);

      return {
        allowed: true,
        reason: 'Permission granted'
      };
    } catch (error) {
      auditEntry.result = 'ERROR';
      auditEntry.denialReason = error.message;
      await this.logAudit(auditEntry);
      throw error;
    }
  }

  /**
   * Check context-based rules (ownership, severity, etc.)
   */
  async checkContextRules(userId, action, resource, resourceId, context, permissions) {
    // Example: Cannot approve incidents with wrong severity
    if (action === 'APPROVE' && resource === 'INCIDENT') {
      const incident = await HSEIncident.findById(resourceId);
      
      // HSE002 cannot approve HIGH/CRITICAL
      const userRoles = context.userRoles || [];
      if (userRoles.includes('HSE_MANAGER')) {
        if (['HIGH', 'CRITICAL'].includes(incident.severity)) {
          return {
            allowed: false,
            reason: `HSE002 cannot approve ${incident.severity} severity incidents`
          };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Check segregation of duties
   */
  async checkSegregationOfDuties(userId, action, resource, context) {
    // Example: Cannot modify incidents you already approved
    if (action === 'MODIFY' && resource === 'INCIDENT') {
      const incident = await HSEIncident.findById(context.resourceId);
      
      if (incident.approvedBy === userId) {
        return {
          allowed: false,
          reason: 'Cannot modify incident you already approved',
          conflictWith: 'APPROVE_INCIDENT'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Log audit entry
   */
  async logAudit(auditEntry) {
    const log = new AuditLog({
      ...auditEntry,
      metadata: {
        timestamp: new Date(),
        ipAddress: auditEntry.ipAddress || 'UNKNOWN'
      }
    });
    
    await log.save();
  }

  /**
   * Get hierarchy ID for user roles
   */
  getRoleHierarchyId(roles) {
    // Map roles to hierarchy ID
    const roleHierarchyMap = {
      'HSSE_CHIEF': 'HSE001',
      'HSE_MANAGER': 'HSE002',
      'COMPLIANCE_CHIEF': 'CONF001',
      'SECURITY_MANAGER': 'REC001'
    };

    for (const role of roles) {
      if (roleHierarchyMap[role]) {
        return roleHierarchyMap[role];
      }
    }

    return null;
  }
}

module.exports = new PermissionService();
```

---

## 🛡️ PERMISSION MIDDLEWARE

### 7. Permissions Middleware

```javascript
// backend/src/middleware/permissions.middleware.js - NEW FILE

const PermissionService = require('../services/permission.service.js');
const AuditLog = require('../models/AuditLog.model.js');

/**
 * Middleware to check permissions
 */
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userRoles = req.user?.roles || [];
      const resourceId = req.params.id;

      // Check permission
      const result = await PermissionService.canPerformAction(
        userId,
        action,
        resource,
        resourceId,
        {
          userRoles,
          method: req.method,
          body: req.body
        }
      );

      if (!result.allowed) {
        return res.status(403).json({
          error: 'Permission denied',
          reason: result.reason
        });
      }

      // Attach permission check result to request
      req.permissionCheck = result;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        error: 'Permission check failed',
        message: error.message
      });
    }
  };
};

/**
 * Middleware to restrict to specific roles
 */
const restrictToRoles = (...roles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasRole = roles.some(r => userRoles.includes(r));

    if (!hasRole) {
      return res.status(403).json({
        error: 'Insufficient role access',
        requiredRoles: roles,
        userRoles
      });
    }

    next();
  };
};

/**
 * Middleware to check segregation of duties
 */
const checkSegregationOfDuties = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const action = req.body?.action;
    const resourceId = req.params.id;

    // Prevent user from modifying their own approvals
    const audit = await AuditLog.findOne({
      userId,
      action: 'APPROVE',
      resourceId,
      result: 'ALLOWED'
    });

    if (audit && req.method === 'PUT') {
      return res.status(403).json({
        error: 'Segregation of duties violation',
        message: 'Cannot modify resource you already approved'
      });
    }

    next();
  } catch (error) {
    console.error('SoD check error:', error);
    return res.status(500).json({
      error: 'SoD check failed'
    });
  }
};

module.exports = {
  requirePermission,
  restrictToRoles,
  checkSegregationOfDuties
};
```

---

## 📝 INCIDENT CONTROLLER UPDATES

### 8. Updated Incident Approval Workflow

```javascript
// backend/src/controllers/incidents.controller.js - MODIFY

const PermissionService = require('../services/permission.service.js');
const AuditLog = require('../models/AuditLog.model.js');

exports.approveIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { comment } = req.body;

    // Get incident
    const incident = await HSEIncident.findById(id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Check if can approve
    const canApprove = await PermissionService.canPerformAction(
      userId,
      'APPROVE',
      'INCIDENT',
      id,
      { severity: incident.severity, userRoles: req.user.roles }
    );

    if (!canApprove.allowed) {
      return res.status(403).json({
        error: 'Cannot approve this incident',
        reason: canApprove.reason
      });
    }

    // HSE002 logic: LOW/MEDIUM approve directly
    if (req.user.roles.includes('HSE_MANAGER')) {
      if (['HIGH', 'CRITICAL'].includes(incident.severity)) {
        // Escalate instead of approve
        incident.approvalStatus = 'ESCALATED_TO_HSE001';
        incident.escalatedBy = userId;
        incident.escalatedAt = new Date();
        
        // Notification to HSE001
        await notificationService.notifyEscalation(
          incident,
          req.user
        );
      } else {
        // Approve LOW/MEDIUM
        incident.approvalStatus = 'APPROVED_HSE002';
        incident.approvedBy = userId;
        incident.approvalDate = new Date();
      }
    } 
    // HSE001 logic: Can approve any severity
    else if (req.user.roles.includes('HSSE_CHIEF')) {
      incident.approvalStatus = 'APPROVED_HSE001';
      incident.approvedBy = userId;
      incident.approvalDate = new Date();
    }

    incident.comments = incident.comments || [];
    incident.comments.push({
      author: userId,
      text: comment,
      timestamp: new Date()
    });

    await incident.save();

    // Audit log
    await AuditLog.create({
      userId,
      action: 'APPROVE_INCIDENT',
      resource: 'INCIDENT',
      resourceId: id,
      result: 'ALLOWED',
      changes: {
        from: 'PENDING',
        to: incident.approvalStatus
      }
    });

    res.json({
      success: true,
      incident,
      message: `Incident ${incident.approvalStatus.toLowerCase()}`
    });
  } catch (error) {
    console.error('Approve incident error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

## 📋 ROUTES SETUP

### 9. New Routes

```javascript
// backend/src/routes/incidents.routes.js - NEW FILE

const router = require('express').Router();
const incidentsController = require('../controllers/incidents.controller');
const { requirePermission, restrictToRoles } = require('../middleware/permissions.middleware');

// Get all incidents
router.get(
  '/',
  requirePermission('INCIDENT', 'READ'),
  incidentsController.getAllIncidents
);

// Create incident
router.post(
  '/',
  requirePermission('INCIDENT', 'CREATE'),
  incidentsController.createIncident
);

// Get specific incident
router.get(
  '/:id',
  requirePermission('INCIDENT', 'READ'),
  incidentsController.getIncident
);

// Approve incident
router.put(
  '/:id/approve',
  requirePermission('INCIDENT', 'APPROVE'),
  incidentsController.approveIncident
);

// Escalate incident
router.put(
  '/:id/escalate',
  restrictToRoles('HSE_MANAGER'),
  requirePermission('INCIDENT', 'ESCALATE'),
  incidentsController.escalateIncident
);

// Export incident
router.get(
  '/:id/export',
  requirePermission('INCIDENT', 'EXPORT'),
  incidentsController.exportIncident
);

module.exports = router;
```

---

## ✅ DATABASE MIGRATION

### 10. Database Setup Script

```sql
-- Create hierarchies
INSERT INTO hierarchies (id, title, department, level, reports_to, supervises, permissions)
VALUES
  ('HSE001', 'Chief of HSSE and Compliance Division', 'HSE', 5, NULL, ['HSE002', 'CONF001', 'REC001'], {...}),
  ('HSE002', 'Chief of Operational HSSE', 'HSE', 4, 'HSE001', ['REC001'], {...}),
  ('CONF001', 'Chief of Compliance & Audits', 'COMPLIANCE', 4, 'HSE001', [], {...}),
  ('REC001', 'Security & Reception Manager', 'OPERATIONS', 3, 'HSE002', [], {...});

-- Update users with hierarchy info
UPDATE users 
SET 
  department = CASE 
    WHEN roles::text LIKE '%HSSE_CHIEF%' THEN 'HSE'
    WHEN roles::text LIKE '%HSE_MANAGER%' THEN 'HSE'
    WHEN roles::text LIKE '%COMPLIANCE_CHIEF%' THEN 'COMPLIANCE'
    WHEN roles::text LIKE '%SECURITY_MANAGER%' THEN 'OPERATIONS'
  END,
  role_level = CASE 
    WHEN roles::text LIKE '%HSSE_CHIEF%' THEN 5
    WHEN roles::text LIKE '%HSE_MANAGER%' THEN 4
    WHEN roles::text LIKE '%COMPLIANCE_CHIEF%' THEN 4
    WHEN roles::text LIKE '%SECURITY_MANAGER%' THEN 3
  END,
  reports_to = (SELECT id FROM users WHERE matricule = CASE 
    WHEN roles::text LIKE '%HSE_MANAGER%' THEN 'HSE001'
    WHEN roles::text LIKE '%COMPLIANCE_CHIEF%' THEN 'HSE001'
    WHEN roles::text LIKE '%SECURITY_MANAGER%' THEN 'HSE002'
  END)
WHERE roles IS NOT NULL;
```

---

## ✅ VALIDATION CHECKLIST

```
[ ] Database schema updated
[ ] Hierarchy model created
[ ] Permission model created
[ ] AuditLog model created
[ ] Permission service implemented
[ ] Permission middleware created
[ ] Incident controller updated with approval logic
[ ] Routes configured with permission checks
[ ] Segregation of duties validation working
[ ] Audit logging functional
[ ] HSE002 escalation to HSE001 working
[ ] CONF001 read access to all incidents
[ ] REC001 security incident reporting
[ ] Notification system updated
[ ] Unit tests passing
[ ] Integration tests passing
[ ] Load tests passed
```

---

**Version**: 1.0.0
**Status**: 📋 IMPLEMENTATION GUIDE
**Next Phase**: Frontend Implementation

