# 📊 MATRICE COMPLÈTE DE PERMISSIONS HSE/COMPLIANCE

**Classification**: Technical Implementation Guide
**Priority**: 🔴 CRITICAL
**For**: Developers & System Administrators

---

## 🔐 SYSTÈME DE RÔLES & PERMISSIONS

### Architecture RBAC (Role-Based Access Control)

```
┌─────────────────────────────────────────────┐
│      USER AUTHENTICATION & ROLES            │
├─────────────────────────────────────────────┤
│ User Profile                                │
│ └─ roles: ['ROLE_A', 'ROLE_B', ...]        │
│    └─ Linked to department/function        │
│       └─ Hierarchy & Supervisor info       │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│      PERMISSION EVALUATION ENGINE           │
├─────────────────────────────────────────────┤
│ Role → Permissions (this matrix)            │
│ Resource Type → Required Permissions       │
│ Resource Owner → Ownership Rules           │
│ Context → Temporal/Situational Checks      │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│      DECISION: ALLOW / DENY                 │
├─────────────────────────────────────────────┤
│ ✅ Allow & Audit                            │
│ ❌ Deny & Log                               │
│ ⚠️  Escalate if needed                      │
└─────────────────────────────────────────────┘
```

---

## 👥 RÔLES SYSTÈME

### Role Definitions

```typescript
// TypeScript Role Enum
enum UserRole {
  // Executive Level
  'HSE001' = 'HSSE_CHIEF',      // Chief of Division
  'HSE002' = 'HSE_MANAGER',      // Operational Chief
  'CONF001' = 'COMPLIANCE_CHIEF', // Compliance & Audits
  'REC001' = 'SECURITY_MANAGER',  // Operations Support
  
  // Legacy/Other Roles (for reference)
  'DG' = 'DG',                   // Directeur Général
  'ADMIN' = 'ADMIN',             // System Admin
}

// Role Hierarchy
interface RoleHierarchy {
  roleId: string;
  level: number;  // 0=lowest, 5=highest
  parentRole?: string;
  department: 'HSE' | 'COMPLIANCE' | 'OPERATIONS' | 'ADMIN';
  reportsTo: string;  // User ID or Role ID
  supervises: string[];  // User IDs or Role IDs
}
```

### Role Levels & Hierarchy

```
Level 5: EXECUTIVE
├─ HSE001 (HSSE_CHIEF)
│  └─ Full system access
│     └─ Strategic oversight
│        └─ Can escalate externally

Level 4: OPERATIONS MANAGER
├─ HSE002 (HSE_MANAGER)
│  └─ Day-to-day operations
│     └─ Incident management
│        └─ Training coordination

Level 4: COMPLIANCE MANAGER
├─ CONF001 (COMPLIANCE_CHIEF)
│  └─ Independent audits
│     └─ Regulatory oversight
│        └─ Parallel to HSE002

Level 3: OPERATIONS SUPPORT
├─ REC001 (SECURITY_MANAGER)
│  └─ Security & reception
│     └─ Visitor management
│        └─ Physical access

Level 2: DEPARTMENT HEADS (DG, etc.)

Level 1: STAFF / EMPLOYEES

Level 0: GUESTS / EXTERNAL
```

---

## 📋 PERMISSION CATEGORIES

### Module Categories

```
MOD_HSE_INCIDENTS
MOD_HSE_TRAININGS
MOD_HSE_AUDITS_OPERATIONAL
MOD_COMPLIANCE_AUDITS
MOD_COMPLIANCE_REPORTS
MOD_COMPLIANCE_DOCUMENTATION
MOD_SECURITY_VISITORS
MOD_SECURITY_EQUIPMENT
MOD_PERSONNEL_MANAGEMENT
MOD_SYSTEM_ADMIN
MOD_REPORTS_EXECUTIVE
```

### Action Permissions

```
// CRUD Operations
ACT_CREATE
ACT_READ
ACT_UPDATE
ACT_DELETE
ACT_EXPORT

// Approval Workflow
ACT_APPROVE
ACT_REJECT
ACT_ESCALATE
ACT_REASSIGN

// Operational Actions
ACT_INVESTIGATE
ACT_COORDINATE
ACT_VERIFY
ACT_REPORT

// Administrative
ACT_AUDIT_TRAIL
ACT_MANAGE_USERS
ACT_CONFIGURE
```

---

## 🔒 DETAILED PERMISSIONS MATRIX

### HSE001 - HSSE_CHIEF (Executive Level)

```typescript
interface HSE001Permissions {
  // INCIDENTS
  incidents: {
    view: ['ALL_INCIDENTS'],  // All incidents globally
    create: ['ANY'],          // Create any incident
    approve: {
      low: ['YES'],           // Approve LOW severity
      medium: ['YES'],        // Approve MEDIUM
      high: ['YES'],          // Approve HIGH
      critical: ['YES']       // Approve CRITICAL
    },
    escalate: ['EXTERNAL'],   // Escalate to regulatory bodies
    modify: ['OWN_AND_OTHERS'], // Modify any incident
    delete: ['OWN_ONLY'],     // Delete only own incidents (special case)
    export: ['ALL_DATA']      // Export all incident data
  },
  
  // TRAININGS
  trainings: {
    view: ['ALL'],            // View all trainings
    create: ['ANY'],          // Create any training
    modify: ['ANY'],          // Modify any training
    coordinate: ['ANY'],      // Coordinate any training
    compliance_validate: ['YES'], // Validate compliance
    export: ['ALL']           // Export training records
  },
  
  // AUDITS
  audits: {
    view: {
      operational: ['ALL'],   // View HSE002's operational audits
      compliance: ['ALL']     // View CONF001's compliance audits
    },
    create: ['ANY'],          // Create any audit
    conduct: ['ANY'],         // Conduct audits
    modify: ['ANY'],          // Modify any audit
    export: ['ALL']           // Export audit reports
  },
  
  // COMPLIANCE
  compliance: {
    view_reports: ['ALL'],    // View all compliance reports
    approve_reports: ['YES'], // Approve compliance reports
    read_audit_findings: ['ALL'], // Read audit findings
    access_historical: ['FULL'] // Full historical access
  },
  
  // PERSONNEL
  personnel: {
    view: ['ALL_EMPLOYEES'],  // View all employees
    manage: ['HSE_TEAM'],     // Manage HSE team only
    assign_roles: ['ROLE_ADMIN'], // Assign roles
    report_generation: ['YES']  // Generate personnel reports
  },
  
  // SYSTEM
  system: {
    audit_trail: ['FULL'],    // Full audit trail access
    user_management: ['HSE_USERS'], // Manage HSE users
    role_assignment: ['HSE_ROLES'], // Assign HSE roles
    configuration: ['READONLY'], // View system config
    external_reporting: ['YES'] // Report to regulators
  }
}
```

### HSE002 - HSE_MANAGER (Operational Level)

```typescript
interface HSE002Permissions {
  // INCIDENTS (Primary responsibility)
  incidents: {
    view: ['OWN_INCIDENTS', 'TEAM_INCIDENTS'], // Own + team incidents
    create: ['YES'],          // Create incidents
    approve: {
      low: ['YES'],           // ✅ Approve LOW directly
      medium: ['YES'],        // ✅ Approve MEDIUM directly
      high: ['NO'],           // ❌ ESCALATE HIGH to HSE001
      critical: ['NO']        // ❌ ESCALATE CRITICAL to HSE001
    },
    escalate: ['HIGH_CRITICAL_ONLY'], // Escalate HIGH/CRITICAL
    modify: ['OWN_ONLY'],     // Modify only own incidents
    delete: ['NO'],           // Cannot delete incidents
    export: ['OWN_INCIDENTS'] // Export only own data
  },
  
  // TRAININGS (Coordination responsibility)
  trainings: {
    view: ['HSE_TRAININGS_ONLY'], // View HSE trainings only
    create: ['HSE'],          // Create HSE trainings
    modify: ['OWN_TRAININGS'], // Modify own trainings
    coordinate: ['YES'],      // Coordinate training sessions
    validate_content: ['NO'], // Cannot validate compliance (NOMSI does)
    export: ['OWN_TRAININGS'] // Export own training data
  },
  
  // AUDITS (Operational audits only)
  audits: {
    view: ['OWN_AUDITS'],     // View only own operational audits
    create: ['OPERATIONAL'], // Create operational audits only
    conduct: ['OPERATIONAL'], // Conduct field audits
    modify: ['OWN_AUDITS'],  // Modify own audits
    read_compliance_audits: ['READONLY'], // Read NOMSI audits (no edit)
    export: ['OWN_AUDITS']   // Export own audit data
  },
  
  // COMPLIANCE (Read-only for context)
  compliance: {
    view_reports: ['READONLY'], // Read-only compliance reports
    approve_reports: ['NO'],    // Cannot approve reports
    read_audit_findings: ['READONLY'], // Read NOMSI findings
    access_historical: ['READONLY']  // Readonly historical access
  },
  
  // PERSONNEL (Supervises REC001)
  personnel: {
    view: ['OWN_TEAM', 'REC001'], // View own + REC001 team
    manage: ['REC001'],       // Manage REC001 only
    assign_roles: ['NO'],     // Cannot assign roles
    report_generation: ['OWN_TEAM'] // Generate own team reports
  },
  
  // SYSTEM
  system: {
    audit_trail: ['OWN_ACTIONS'], // View own audit trail only
    user_management: ['NO'],  // Cannot manage users
    role_assignment: ['NO'],  // Cannot assign roles
    configuration: ['NO'],    // Cannot configure system
    external_reporting: ['NO'] // Cannot report externally
  }
}
```

### CONF001 - COMPLIANCE_CHIEF (Compliance Level)

```typescript
interface CONF001Permissions {
  // INCIDENTS (Audit oversight)
  incidents: {
    view: ['ALL_INCIDENTS'], // ✅ Read ALL incidents (audit trail)
    create: ['NO'],          // ❌ Cannot create incidents
    approve: ['NO'],         // ❌ Cannot approve incidents
    escalate: ['NO'],        // ❌ Cannot escalate
    modify: ['NO'],          // ❌ Read-only access
    delete: ['NO'],          // ❌ Cannot delete
    export: ['ALL_INCIDENTS'] // Export all for audit purposes
  },
  
  // TRAININGS (Compliance validation)
  trainings: {
    view: ['ALL_TRAININGS'],     // View all trainings
    create: ['NO'],              // Cannot create trainings
    modify: ['NO'],              // Cannot modify trainings
    coordinate: ['NO'],          // Cannot coordinate
    validate_content: ['YES'],   // ✅ Validate compliance
    verify_completion: ['YES'],  // ✅ Verify completion records
    export: ['ALL_TRAININGS']    // Export for compliance records
  },
  
  // AUDITS (Compliance audit authority)
  audits: {
    view: ['ALL_AUDITS'],        // View all audits
    create: ['COMPLIANCE'],      // Create compliance audits
    conduct: ['COMPLIANCE'],     // Conduct compliance audits
    modify: ['OWN_AUDITS'],      // Modify own compliance audits
    review_operational: ['READONLY'], // Review HSE2 operational audits
    export: ['ALL_AUDITS']       // Export audit data
  },
  
  // COMPLIANCE (Full authority)
  compliance: {
    view_reports: ['ALL'],       // View all compliance reports
    approve_reports: ['NO'],     // HSE001 approves, NOMSI prepares
    create_reports: ['YES'],     // Create compliance reports
    audit_findings: {
      create: ['YES'],           // Create audit findings
      modify: ['OWN'],           // Modify own findings
      publish: ['YES']           // Publish findings
    },
    nonconformities: {
      record: ['YES'],           // Record nonconformities
      track: ['YES'],            // Track corrections
      verify: ['YES']            // Verify corrections
    },
    regulatory_requirements: {
      document: ['YES'],         // Document requirements
      track_changes: ['YES'],    // Track regulatory changes
      compliance_mapping: ['YES'] // Map to ISO 45001, etc.
    },
    access_historical: ['FULL']  // Full historical access
  },
  
  // PERSONNEL
  personnel: {
    view: ['NO'],               // Cannot view personnel
    manage: ['NO'],             // Cannot manage personnel
    training_records: ['READONLY'], // Read training records for validation
    assign_roles: ['NO'],       // Cannot assign roles
    report_generation: ['NO']   // Cannot generate personnel reports
  },
  
  // SYSTEM
  system: {
    audit_trail: ['FULL'],      // Full audit trail access
    user_management: ['NO'],    // Cannot manage users
    role_assignment: ['NO'],    // Cannot assign roles
    configuration: ['READONLY'], // View configuration only
    external_reporting: ['NO']  // HSE001 reports externally
  }
}
```

### REC001 - SECURITY_MANAGER (Operations Support)

```typescript
interface REC001Permissions {
  // INCIDENTS (Security-specific)
  incidents: {
    view: ['OWN_SECURITY_INCIDENTS'], // View own security incidents
    create: ['SECURITY_INCIDENTS_ONLY'], // Create security incident reports
    approve: ['NO'],           // ❌ Cannot approve (reports to HSE002)
    escalate: ['NO'],          // ❌ Escalates via HSE002
    modify: ['OWN_INCIDENTS'], // Modify own incidents only
    delete: ['NO'],            // Cannot delete
    export: ['OWN_INCIDENTS']  // Export own security data
  },
  
  // TRAININGS (No access to HSE trainings)
  trainings: {
    view: ['OWN_TRAINING_HISTORY'], // View own training record
    create: ['NO'],            // Cannot create
    modify: ['NO'],            // Cannot modify
    coordinate: ['NO'],        // Cannot coordinate
    validate_content: ['NO'],  // Cannot validate
    export: ['NO']             // Cannot export
  },
  
  // AUDITS (No direct audit access)
  audits: {
    view: ['NO'],              // No audit access
    create: ['NO'],            // Cannot create
    conduct: ['NO'],           // Cannot conduct
    modify: ['NO'],            // Cannot modify
    export: ['NO']             // Cannot export
  },
  
  // COMPLIANCE (No access)
  compliance: {
    view_reports: ['NO'],      // No compliance reports
    approve_reports: ['NO'],   // No approval authority
    read_audit_findings: ['NO'] // No access to audits
  },
  
  // SECURITY & VISITORS (Primary responsibility)
  security: {
    visitors: {
      view: ['ALL_VISITORS'],      // View all visitor records
      create: ['VISITOR_LOGS'],    // Log visitors
      modify: ['VISITOR_LOGS'],    // Update visitor records
      export: ['VISITOR_DATA']     // Export visitor reports
    },
    equipment: {
      view: ['HSE_EQUIPMENT'],     // View HSE safety equipment
      manage: ['HSE_EQUIPMENT'],   // Manage badges, access cards
      track: ['YES'],              // Track equipment status
      maintenance: ['YES']         // Log maintenance
    },
    access_control: {
      manage_badges: ['YES'],      // Issue/revoke badges
      manage_doors: ['RECEIVE_AREA'], // Control access areas
      emergency_override: ['RECEIVE_AREA'] // Emergency access
    },
    reporting: {
      incident_logs: ['YES'],      // Create incident logs
      daily_summary: ['YES'],      // Generate daily summary
      export: ['SECURITY_DATA']    // Export security reports
    }
  },
  
  // PERSONNEL (No management access)
  personnel: {
    view: ['NO'],              // Cannot view other personnel
    manage: ['NO'],            // Cannot manage personnel
    assign_roles: ['NO'],      // Cannot assign roles
    report_generation: ['NO']  // Cannot generate reports
  },
  
  // SYSTEM
  system: {
    audit_trail: ['LIMITED'],  // View own actions only
    user_management: ['NO'],   // Cannot manage users
    role_assignment: ['NO'],   // Cannot assign roles
    configuration: ['NO'],     // Cannot configure
    external_reporting: ['NO'] // Cannot report externally
  }
}
```

---

## 📊 CROSS-FUNCTIONAL PERMISSION MATRIX

### Resource-Based Permissions

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    COMPLETE PERMISSION MATRIX                              ║
╠══════════════════════╦═══════════╦═══════════╦════════════╦════════════════╣
║ RESOURCE             ║ HSE001    ║ HSE002    ║ CONF001    ║ REC001         ║
║                      ║ (Chief)   ║ (Ops)     ║ (Compli.)  ║ (Security)     ║
╠══════════════════════╬═══════════╬═══════════╬════════════╬════════════════╣

║ INCIDENTS            ║           ║           ║            ║                ║
║ ├─ View All          ║ ✅ Full   ║ ⚠️ Own    ║ ✅ Read    ║ ❌ No          ║
║ ├─ Create            ║ ✅ YES    ║ ✅ YES    ║ ❌ No      ║ ⚠️ Security    ║
║ ├─ Approve LOW       ║ ✅ YES    ║ ✅ YES    ║ ❌ No      ║ ❌ No          ║
║ ├─ Approve MEDIUM    ║ ✅ YES    ║ ✅ YES    ║ ❌ No      ║ ❌ No          ║
║ ├─ Approve HIGH      ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║
║ ├─ Escalate CRITICAL ║ ✅ YES    ║ ✅ YES    ║ ❌ No      ║ ❌ No          ║
║ ├─ Modify            ║ ✅ Any    ║ ⚠️ Own    ║ ❌ No      ║ ⚠️ Own         ║
║ ├─ Delete            ║ ⚠️ Own    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║
║ └─ Export            ║ ✅ All    ║ ⚠️ Own    ║ ✅ All     ║ ⚠️ Own         ║

║ CORRECTIVE ACTIONS   ║           ║           ║            ║                ║
║ ├─ Assign (LOW/MED)  ║ ✅ YES    ║ ✅ YES    ║ ❌ No      ║ ❌ No          ║
║ ├─ Assign (HIGH/CR)  ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║
║ ├─ Track             ║ ✅ All    ║ ✅ Own    ║ ✅ All     ║ ⚠️ Assigned    ║
║ ├─ Verify Complete   ║ ✅ YES    ║ ✅ YES    ║ ✅ YES     ║ ⚠️ Assigned    ║
║ └─ Update Status     ║ ✅ YES    ║ ✅ Own    ║ ✅ YES     ║ ⚠️ Assigned    ║

║ TRAININGS            ║           ║           ║            ║                ║
║ ├─ View All          ║ ✅ Full   ║ ⚠️ HSE    ║ ✅ Full    ║ ❌ No          ║
║ ├─ Create            ║ ✅ YES    ║ ⚠️ HSE    ║ ❌ No      ║ ❌ No          ║
║ ├─ Coordinate        ║ ✅ YES    ║ ✅ YES    ║ ❌ No      ║ ❌ No          ║
║ ├─ Validate Content  ║ ✅ YES    ║ ❌ No     ║ ✅ YES     ║ ❌ No          ║
║ ├─ Record Completion ║ ✅ YES    ║ ✅ YES    ║ ❌ No      ║ ❌ No          ║
║ └─ Export Records    ║ ✅ All    ║ ⚠️ Own    ║ ✅ All     ║ ❌ No          ║

║ COMPLIANCE AUDITS    ║           ║           ║            ║                ║
║ ├─ View              ║ ✅ Full   ║ ⚠️ Read   ║ ✅ Full    ║ ❌ No          ║
║ ├─ Create            ║ ✅ YES    ║ ❌ No     ║ ✅ YES     ║ ❌ No          ║
║ ├─ Conduct           ║ ✅ YES    ║ ❌ No     ║ ✅ YES     ║ ❌ No          ║
║ ├─ Record Findings   ║ ✅ YES    ║ ❌ No     ║ ✅ YES     ║ ❌ No          ║
║ ├─ Publish Report    ║ ✅ Approve║ ❌ No     ║ ✅ Create  ║ ❌ No          ║
║ └─ Track Remediation ║ ✅ YES    ║ ✅ YES    ║ ✅ YES     ║ ❌ No          ║

║ OPERATIONAL AUDITS   ║           ║           ║            ║                ║
║ ├─ View All          ║ ✅ Full   ║ ✅ Full   ║ ✅ Read    ║ ❌ No          ║
║ ├─ Create            ║ ✅ YES    ║ ✅ YES    ║ ❌ No      ║ ❌ No          ║
║ ├─ Conduct           ║ ✅ YES    ║ ✅ YES    ║ ❌ No      ║ ❌ No          ║
║ └─ Modify            ║ ✅ Any    ║ ⚠️ Own    ║ ❌ No      ║ ❌ No          ║

║ COMPLIANCE REPORTS   ║           ║           ║            ║                ║
║ ├─ Create            ║ ❌ No     ║ ❌ No     ║ ✅ YES     ║ ❌ No          ║
║ ├─ Approve           ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║
║ ├─ View              ║ ✅ All    ║ ⚠️ Read   ║ ✅ All     ║ ❌ No          ║
║ └─ Publish External  ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║

║ VISITORS             ║           ║           ║            ║                ║
║ ├─ View All          ║ ✅ Full   ║ ⚠️ Read   ║ ❌ No      ║ ✅ Full        ║
║ ├─ Log Entry         ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ✅ YES         ║
║ ├─ Issue Badge       ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ✅ YES         ║
║ └─ Export            ║ ✅ All    ║ ❌ No     ║ ❌ No      ║ ✅ Security    ║

║ AUDIT TRAIL          ║           ║           ║            ║                ║
║ ├─ View Own          ║ ✅ Full   ║ ✅ Own    ║ ✅ Own     ║ ✅ Own         ║
║ ├─ View All          ║ ✅ YES    ║ ❌ No     ║ ✅ YES     ║ ❌ No          ║
║ ├─ Export            ║ ✅ YES    ║ ❌ No     ║ ✅ YES     ║ ❌ No          ║
║ └─ Generate Reports  ║ ✅ YES    ║ ❌ No     ║ ✅ YES     ║ ❌ No          ║

║ PERSONNEL MGMT       ║           ║           ║            ║                ║
║ ├─ View All          ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║
║ ├─ Manage HSE Team   ║ ✅ YES    ║ ⚠️ REC001 ║ ❌ No      ║ ❌ No          ║
║ ├─ Assign Roles      ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║
║ └─ Generate Reports  ║ ✅ YES    ║ ⚠️ Own    ║ ❌ No      ║ ❌ No          ║

║ SYSTEM CONFIG        ║           ║           ║            ║                ║
║ ├─ View              ║ ⚠️ Read   ║ ❌ No     ║ ⚠️ Read    ║ ❌ No          ║
║ ├─ Modify            ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║
║ ├─ User Management   ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║
║ └─ Backup/Recovery   ║ ✅ YES    ║ ❌ No     ║ ❌ No      ║ ❌ No          ║

╚══════════════════════╩═══════════╩═══════════╩════════════╩════════════════╝

LEGEND:
✅ Full Access (Create/Read/Update/Delete/Export as applicable)
⚠️  Conditional Access (Specific criteria must be met)
❌ No Access (Permission Denied)
```

---

## 🚫 STRICT SEGREGATION OF DUTIES

### Prohibited Actions

```
╔════════════════════════════════════════════════════════════════╗
║              STRICTLY PROHIBITED ACTIONS                       ║
╠════════════════════════════════════════════════════════════════╣

HSE002 ❌ CANNOT:
├─ Approve incidents marked for escalation to HSE001
├─ Access compliance audit reports (confidentiality)
├─ Modify own incident severity to avoid escalation
├─ Manage CONF001 personnel or functions
├─ Override or edit CONF001's audit findings
├─ Delete or archive incident records
├─ Export compliance-related data
├─ Approve corrective actions from CONF001
├─ Modify training validation status
├─ Generate compliance reports

CONF001 ❌ CANNOT:
├─ Approve incidents operationally
├─ Modify HSE002's incident declarations
├─ Modify HSE002's corrective action assignments
├─ Make operational HSE decisions
├─ Override HSE002's incident approvals
├─ Access REC001's physical security logs
├─ Manage HSE operational personnel
├─ Participate in incident investigations (except auditing)
├─ Direct corrective actions (only verify)
├─ Approve operational training content

REC001 ❌ CANNOT:
├─ Access compliance audit data
├─ Modify incidents created by others
├─ Approve any HSE actions
├─ Access audit findings or reports
├─ Manage HSE training content
├─ Escalate incidents (reports to HSE002)
├─ Access personnel management data
├─ Modify own training records
├─ Export incident data
├─ Access system configuration

HSE001 ⚠️  LIMITS:
├─ Cannot remove audit trail entries
├─ Cannot bypass CONF001 compliance reviews
├─ Cannot force CONF001 to modify findings
├─ Cannot delete permanent incident records
├─ Should involve both HSE002 & CONF001 for major decisions
└─ External reporting requires documented approval chain

╚════════════════════════════════════════════════════════════════╝
```

---

## 🔄 DYNAMIC PERMISSION EVALUATION

### Context-Based Rules

```typescript
// Example: Incident Approval Logic
function canApproveIncident(user: User, incident: Incident): boolean {
  // Rule 1: User must have HSE_MANAGER or HSSE_CHIEF role
  if (!user.roles.includes('HSE_MANAGER') && !user.roles.includes('HSSE_CHIEF')) {
    return false;  // No permission
  }
  
  // Rule 2: If HSE_MANAGER (HSE002), only approve LOW/MEDIUM
  if (user.roles.includes('HSE_MANAGER')) {
    if (['HIGH', 'CRITICAL'].includes(incident.severity)) {
      return false;  // Must escalate
    }
    // Must be own incident or team incident
    return incident.ownedBy === user.id || incident.team === user.team;
  }
  
  // Rule 3: If HSSE_CHIEF (HSE001), can approve any severity
  if (user.roles.includes('HSSE_CHIEF')) {
    return true;  // Full approval authority
  }
  
  return false;
}

// Example: Report Access Logic
function canAccessComplianceReport(user: User, report: ComplianceReport): boolean {
  // HSE001: Full access
  if (user.roles.includes('HSSE_CHIEF')) return true;
  
  // CONF001: Can access own reports
  if (user.roles.includes('COMPLIANCE_CHIEF')) {
    return report.author === user.id;
  }
  
  // HSE002: Can read reports (readonly) but not modify
  if (user.roles.includes('HSE_MANAGER')) {
    return !('modify' in getRequestedAction());
  }
  
  // Others: No access
  return false;
}

// Example: Data Visibility Logic
function filterIncidentsForUser(user: User, incidents: Incident[]): Incident[] {
  // HSE001: Can see all incidents
  if (user.roles.includes('HSSE_CHIEF')) {
    return incidents;
  }
  
  // HSE002: Can see own incidents and team incidents
  if (user.roles.includes('HSE_MANAGER')) {
    return incidents.filter(i =>
      i.ownedBy === user.id ||
      i.createdBy === user.id ||
      i.team === user.team ||
      i.assignedTo === user.id
    );
  }
  
  // CONF001: Can see all incidents (for audit) but read-only
  if (user.roles.includes('COMPLIANCE_CHIEF')) {
    return incidents;  // Visibility yes, modification no
  }
  
  // REC001: Can see security-related incidents
  if (user.roles.includes('SECURITY_MANAGER')) {
    return incidents.filter(i => i.category === 'SECURITY');
  }
  
  return [];
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Database Schema Updates

```sql
-- Add hierarchical tracking
ALTER TABLE users ADD COLUMN reporting_manager_id UUID;
ALTER TABLE users ADD COLUMN supervised_by_role VARCHAR;
ALTER TABLE users ADD COLUMN department VARCHAR;

-- Add permission tracking
CREATE TABLE permission_assignments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_id VARCHAR NOT NULL,
  granted_by UUID,
  granted_at TIMESTAMP,
  expires_at TIMESTAMP,
  context JSONB  -- For conditional permissions
);

-- Add audit trail
CREATE TABLE action_audit_log (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  resource_type VARCHAR NOT NULL,
  resource_id UUID NOT NULL,
  result VARCHAR,  -- ALLOWED / DENIED
  timestamp TIMESTAMP,
  reason TEXT,
  ip_address INET
);
```

### Permission Engine Implementation

```typescript
// src/permissions/PermissionEngine.ts
class PermissionEngine {
  async checkPermission(
    user: User,
    action: string,
    resource: Resource,
    context?: PermissionContext
  ): Promise<PermissionDecision> {
    // 1. Get user roles
    const roles = user.roles;
    
    // 2. Check role-based permissions
    const rolePermissions = this.getRolePermissions(roles);
    
    // 3. Apply context-based rules
    const contextRules = this.getContextRules(resource, context);
    
    // 4. Evaluate segregation of duties
    const sowCheck = this.evaluateSoD(user, resource);
    
    // 5. Make decision
    const decision = await this.evaluate(
      rolePermissions,
      contextRules,
      sowCheck
    );
    
    // 6. Audit log
    this.auditLog(user, action, resource, decision);
    
    return decision;
  }
}
```

---

## 📞 SUPPORT & QUESTIONS

**For Implementation Help**: developers@sogara.ga
**For Permission Reviews**: hse001@sogara.ga
**For Audit Queries**: compliance@sogara.ga

---

**Version**: 2.0.0
**Last Updated**: Octobre 2025
**Status**: 📊 IMPLEMENTATION GUIDE

