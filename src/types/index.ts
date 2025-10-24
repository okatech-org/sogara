export type UserRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'RECEP'
  | 'HSE'
  | 'HSE_MANAGER' // Chef HSSE Opérationnel (HSE002) ⭐ NEW
  | 'HSSE_CHIEF' // Chef de Division HSSE (HSE001)
  | 'SUPERVISEUR'
  | 'EMPLOYE'
  | 'COMMUNICATION'
  | 'DG'
  | 'DRH'
  | 'COMPLIANCE'
  | 'SECURITE'
  | 'EXTERNE'

// Hiérarchie des permissions HSSE
export const ROLE_PERMISSIONS = {
  HSSE_CHIEF: {
    // Vue d'ensemble et statistiques
    viewDashboard: true,
    viewAllStatistics: true,
    exportReports: true,

    // Gestion des comptes HSSE
    createHSEAccount: true,
    createSecurityAccount: true,
    manageHSSEAccounts: true,
    assignRoles: true,

    // Accès en lecture aux modules (pas d'actions opérationnelles)
    viewIncidents: true,
    viewFormations: true,
    viewVisits: true,
    viewMail: true,
    viewEquipment: true,

    // Pas d'actions opérationnelles
    createIncident: false,
    validateFormation: false,
    checkInVisitor: false,
    registerMail: false,
  },
  HSE_MANAGER: {
    // Vue d'ensemble et statistiques
    viewDashboard: true,
    viewAllStatistics: true,
    exportReports: true,

    // Gestion opérationnelle HSE quotidienne
    createIncident: true,
    approveIncidents: true, // Peut approuver LOW/MEDIUM, doit escalader HIGH/CRITICAL
    validateFormation: true,
    manageHSEOperations: true,
    coordinateTrainings: true,
    conductAudits: true,

    // Accès aux modules HSE uniquement
    viewIncidents: true,
    viewFormations: true,
    viewEquipment: true,

    // Pas d'accès aux modules sécurité
    viewVisits: false,
    viewMail: false,
    checkInVisitor: false,
    registerMail: false,
  },
  HSE: {
    // Vue d'ensemble et statistiques
    viewDashboard: true,
    viewAllStatistics: true,
    exportReports: true,

    // Gestion opérationnelle HSE uniquement
    createIncident: true,
    validateFormation: true,
    manageHSEOperations: true,

    // Accès aux modules HSE uniquement
    viewIncidents: true,
    viewFormations: true,
    viewEquipment: true,

    // Pas d'accès aux modules sécurité
    viewVisits: false,
    viewMail: false,
    checkInVisitor: false,
    registerMail: false,
  },
  SECURITE: {
    // Vue d'ensemble et statistiques
    viewDashboard: true,
    viewAllStatistics: true,
    exportReports: true,

    // Gestion sécurité uniquement
    manageSecurityOperations: true,
    checkInVisitor: true,
    registerMail: true,
    manageEquipment: true,

    // Accès aux modules sécurité uniquement
    viewVisits: true,
    viewMail: true,
    viewEquipment: true,

    // Pas d'accès aux modules HSE
    viewIncidents: false,
    viewFormations: false,
    createIncident: false,
    validateFormation: false,
  },
  COMPLIANCE: {
    // Vue d'ensemble et statistiques
    viewDashboard: true,
    viewAllStatistics: true,
    exportReports: true,

    // Gestion conformité uniquement
    manageCompliance: true,
    createAudits: true,
    manageNonConformities: true,
    generateComplianceReports: true,

    // Accès aux modules conformité uniquement
    viewIncidents: true,
    viewFormations: true,

    // Pas d'accès aux modules opérationnels
    viewVisits: false,
    viewMail: false,
    viewEquipment: false,
    createIncident: false,
    validateFormation: false,
    checkInVisitor: false,
    registerMail: false,
  },
  EXTERNE: {
    // Accès limité pour candidats externes
    viewDashboard: true,
    viewOwnTrainings: true,
    viewOwnAssessments: true,
    viewOwnCertificates: true,

    // Pas d'accès aux modules internes
    viewIncidents: false,
    viewFormations: false,
    viewVisits: false,
    viewMail: false,
    viewEquipment: false,
    createIncident: false,
    validateFormation: false,
    checkInVisitor: false,
    registerMail: false,
  },
} as const

// Hiérarchie des rôles HSSE
export const HSSE_ROLE_HIERARCHY = {
  HSSE_CHIEF: {
    level: 2,
    label: 'Chef de Division HSSE',
    canApprove: ['incidents', 'trainings', 'audits', 'budgets'],
    canManage: ['hsse_team', 'compliance_team', 'security_team'],
    reportsTo: ['DG', 'ADMIN']
  },
  HSE_MANAGER: {
    level: 1,
    label: 'Chef HSSE Opérationnel',
    canApprove: ['incidents_medium_low', 'routine_audits', 'operational_trainings'],
    canManage: ['daily_incidents', 'field_audits', 'training_coordination'],
    reportsTo: ['HSSE_CHIEF', 'DG', 'ADMIN'],
    requiresApprovalFrom: ['HSSE_CHIEF'],
    for: ['critical_incidents', 'major_audits'],
    cannotManage: ['compliance_audits', 'strategic_decisions', 'budgets'],
  },
  HSE: {
    level: 1,
    label: 'Chef HSSE Opérationnel',
    canApprove: ['daily_incidents', 'hse_trainings'],
    canManage: ['hse_operations'],
    reportsTo: ['HSSE_CHIEF', 'DG', 'ADMIN'],
    requiresApproval: ['critical_incidents', 'major_trainings']
  },
  SECURITE: {
    level: 1,
    label: 'Responsable Sécurité',
    canApprove: ['visits', 'security_incidents'],
    canManage: ['security_operations', 'visits', 'mail', 'equipment'],
    reportsTo: ['HSSE_CHIEF', 'DG', 'ADMIN']
  },
  COMPLIANCE: {
    level: 1,
    label: 'Responsable Conformité',
    canApprove: ['non_conformities', 'audits'],
    canManage: ['compliance_audits', 'regulatory_watch'],
    reportsTo: ['HSSE_CHIEF', 'DG', 'ADMIN']
  }
} as const

export type VisitStatus = 'expected' | 'waiting' | 'in_progress' | 'checked_out'
export type PackageStatus = 'received' | 'stored' | 'delivered'
export type EquipmentStatus = 'operational' | 'maintenance' | 'out_of_service'
export type Priority = 'normal' | 'urgent'
export type NotificationType = 'urgent' | 'warning' | 'info' | 'success'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  matricule: string
  service: string
  roles: UserRole[]
  competences: string[]
  habilitations: string[]
  email?: string
  phone?: string
  photo?: string
  status: 'active' | 'inactive'
  stats: {
    visitsReceived: number
    packagesReceived: number
    hseTrainingsCompleted: number
  }
  equipmentIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Visitor {
  id: string
  firstName: string
  lastName: string
  company: string
  idDocument: string
  documentType: 'cin' | 'passport' | 'other'
  phone?: string
  email?: string
  photo?: string
  createdAt: Date
}

export interface Visit {
  id: string
  visitorId: string
  hostEmployeeId: string
  scheduledAt: Date
  checkedInAt?: Date
  checkedOutAt?: Date
  status: VisitStatus
  purpose: string
  notes?: string
  badgeNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface PackageMail {
  id: string
  type: 'package' | 'mail'
  reference: string
  sender: string
  recipientEmployeeId?: string
  recipientService?: string // Pour les courriers adressés à un service
  description: string
  photoUrl?: string
  isConfidential?: boolean // Courrier confidentiel: pas de scan
  scannedFileUrls?: string[] // Courrier non confidentiel: fichiers scannés
  priority: Priority
  status: PackageStatus
  receivedAt: Date
  deliveredAt?: Date
  deliveredBy?: string
  signature?: string
  createdAt: Date
  updatedAt: Date
}

// Interfaces pour les Analytics
export interface AnalyticsData {
  id: string
  type: 'dashboard' | 'hse' | 'visits' | 'packages' | 'equipment' | 'training'
  metric: string
  value: number
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  date: Date
  metadata?: any
  department?: string
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

// Interfaces pour les Workflows d'Approbation
export interface ApprovalWorkflow {
  id: string
  type: 'hse_incident' | 'training_approval' | 'equipment_purchase' | 'policy_change' | 'audit_plan'
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requesterId: string
  approverId?: string
  currentStep: number
  totalSteps: number
  workflowData?: any
  approvalHistory?: Array<{
    stepId: string
    approverId: string
    decision: 'approved' | 'rejected'
    comments?: string
    timestamp: Date
  }>
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ApprovalStep {
  id: string
  workflowId: string
  stepNumber: number
  stepName: string
  approverId: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  comments?: string
  approvedAt?: Date
  dueDate?: Date
  isRequired: boolean
  canDelegate: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Equipment {
  id: string
  type: string
  label: string
  serialNumber?: string
  holderEmployeeId?: string
  status: EquipmentStatus
  nextCheckDate?: Date
  description?: string
  location?: string
  history: EquipmentHistory[]
  createdAt: Date
  updatedAt: Date
}

export interface EquipmentHistory {
  id: string
  equipmentId: string
  employeeId?: string
  action: 'assigned' | 'unassigned' | 'maintenance' | 'check' | 'incident'
  notes?: string
  createdAt: Date
}

export interface HSEIncident {
  id: string
  employeeId: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location: string
  occurredAt: Date
  status: 'reported' | 'investigating' | 'action_required' | 'monitoring' | 'resolved' | 'closed'
  
  // Approval workflow for HSE002
  approvalStatus: 'pending' | 'approved_hse002' | 'requires_hse001' | 'approved_hse001'
  approvedBy?: string // HSE002 or HSE001 ID
  approvalDate?: Date
  
  // Investigation & Actions
  rootCause?: string
  correctiveActions: {
    id?: string
    action: string
    assignedTo: string
    dueDate: Date
    status: 'pending' | 'in_progress' | 'completed'
    completedDate?: Date
  }[]
  
  // Audit trail
  attachments?: string[]
  reportedBy: string
  investigatedBy?: string
  assignedTo?: string // HSE002 or HSE001
  
  // Notifications
  notifications: {
    toHSE001: boolean
    toDirector: boolean
    toOthers: string[] // Employee IDs
  }
  
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
}

// Approval Rules (Business Logic)
export const incidentApprovalRules = {
  'critical': { requiresHSE001: true, requiresDirector: false },
  'high': { requiresHSE001: true, requiresDirector: false },
  'medium': { requiresHSE001: false, requiresDirector: false }, // HSE002 can approve
  'low': { requiresHSE001: false, requiresDirector: false },
} as const

export interface HSETraining {
  id: string
  title: string
  description: string
  category: 'MANDATORY' | 'RECOMMENDED' | 'SPECIALIZED'
  code?: string
  requiredForRoles: UserRole[]
  duration: number // minutes
  validityMonths: number
  sessions: HSETrainingSession[]
  
  // Coordination by HSE002
  coordinatedBy: string // HSE002 or HSE001 ID
  coordinatorName?: string
  
  // Training schedule
  schedule: {
    startDate: Date
    endDate: Date
    sessions: {
      id?: string
      date: Date
      time: string // "09:00-11:00"
      location: string
      maxParticipants: number
      enrolled: string[] // Employee IDs
    }[]
  }
  
  // Content
  content?: {
    modules: {
      title: string
      description: string
      videoUrl?: string
      materials?: string[]
      quiz?: {
        questions: {
          id: string
          text: string
          answers: string[]
          correct: number
        }[]
        passingScore: number
      }
    }[]
  }
  
  // Compliance tracking
  compliance: {
    regulationReference: string // ISO 45001, OSHA, etc.
    requiredFrequency: 'annual' | 'biennial' | 'triennial' | 'one_time'
  }
  
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface TrainingParticipant {
  id: string
  trainingId: string
  employeeId: string
  enrollmentDate: Date
  attendedDate?: Date
  attended: boolean
  quizScore?: number // 0-100
  certificateGenerated: boolean
  certificateDate?: Date
  certificateUrl?: string
  status: 'ENROLLED' | 'ATTENDED' | 'CERTIFIED' | 'FAILED' | 'CANCELLED'
}

export interface HSEAudit {
  id: string
  code: string // e.g., 'AUDIT-2025-001'
  title: string
  description: string
  type: 'internal' | 'scheduled' | 'emergency'
  scope: string // e.g., "Production Unit A"
  auditedBy: string // HSE002 usually, HSE001 for major audits
  
  schedule: {
    plannedDate: Date
    actualStartDate?: Date
    actualEndDate?: Date
    duration: number // hours
  }
  
  standards: string[] // ['ISO 45001', 'OSHA', 'API']
  
  findings: {
    id: string
    category: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    evidence: string[] // Photo/video URLs
    nonconformity: boolean
    requiredAction: string
  }[]
  
  nonconformities: {
    id: string
    finding_id: string
    description: string
    assignedTo: string // Department manager
    correctionDueDate: Date
    status: 'open' | 'in_progress' | 'closed'
    evidenceOfCorrection?: string[]
    closedDate?: Date
  }[]
  
  reportGenerated: boolean
  reportUrl?: string
  reportDate?: Date
  
  status: 'planned' | 'in_progress' | 'completed' | 'reported'
  createdAt: Date
  updatedAt: Date
}

export interface HSETrainingModule {
  id: string
  code: string
  title: string
  category: 'Critique' | 'Obligatoire' | 'Spécialisée' | 'Management' | 'Prévention'
  description: string
  objectives: string[]
  duration: number
  durationUnit: 'heures' | 'minutes' | 'jours'
  validityMonths: number
  requiredForRoles: UserRole[]
  prerequisites: string[]
  certification: {
    examRequired: boolean
    passingScore: number | null
    practicalTest: boolean
    certificateType: string
  }
  instructor: {
    qualificationRequired: string
    minExperience: string
  }
  maxParticipants: number
  language: string[]
  deliveryMethods: string[]
  refresherRequired: boolean
  refresherFrequency: number
  content: HSETrainingContent
}

export interface HSETrainingContent {
  modules: HSEContentModule[]
  resources: HSETrainingResource[]
  assessments: HSEAssessment[]
}

export interface HSEContentModule {
  id: string
  title: string
  duration: number
  description: string
  content: HSEModuleSection[]
  illustrations?: HSEIllustration[]
}

export interface HSEModuleSection {
  id: string
  title: string
  content: string
  type: 'text' | 'checklist' | 'case_study' | 'procedure' | 'safety_rules' | 'emergency_protocol'
  illustrations?: HSEIllustration[]
  interactive?: HSEInteractiveElement[]
}

export interface HSEIllustration {
  id: string
  type: 'diagram' | 'photo' | 'schema' | 'infographic' | 'chart'
  title: string
  description: string
  url: string
  alt: string
}

export interface HSEInteractiveElement {
  id: string
  type: 'quiz' | 'simulation' | 'checklist' | 'video' | 'animation'
  title: string
  content: any
}

export interface HSETrainingResource {
  id: string
  title: string
  type: 'pdf' | 'video' | 'document' | 'link' | 'checklist'
  url: string
  description: string
  downloadable: boolean
}

export interface HSEAssessment {
  id: string
  title: string
  type: 'qcm' | 'practical' | 'case_study'
  questions: HSEQuestion[]
  passingScore: number
  duration: number
}

export interface HSEQuestion {
  id: string
  text: string
  type: 'multiple_choice' | 'true_false' | 'open'
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  illustration?: HSEIllustration
}

export interface HSETrainingProgress {
  id: string
  employeeId: string
  trainingModuleId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'expired'
  currentModule?: string
  completedModules: string[]
  assessmentResults: HSEAssessmentResult[]
  startedAt?: Date
  completedAt?: Date
  certificateIssuedAt?: Date
  expiresAt?: Date
}

export interface HSEAssessmentResult {
  assessmentId: string
  score: number
  passed: boolean
  attempts: number
  completedAt: Date
  answers: any[]
}

export interface HSETrainingSession {
  id: string
  trainingId: string
  date: Date
  instructor: string
  location: string
  maxParticipants: number
  attendance: HSEAttendance[]
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export interface HSEAttendance {
  employeeId: string
  status: 'registered' | 'present' | 'absent' | 'completed'
  score?: number
  certificationDate?: Date
  expirationDate?: Date
  notes?: string
}

export interface HSENotification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  metadata?: {
    employeeId?: string
    trainingId?: string
    incidentId?: string
    equipmentId?: string
    daysUntilExpiry?: number
    complianceRate?: number
    sentBy?: string
  }
}

export interface NotificationAction {
  label: string
  action: string
  style?: 'primary' | 'secondary' | 'destructive'
}

export interface FolderDocument {
  id: string
  ownerType: 'employee' | 'service'
  ownerId?: string // requis si ownerType = 'employee'
  serviceName?: string // requis si ownerType = 'service'
  source: 'mail' | 'package' | 'manual'
  name: string
  url: string // Data URL ou URL distante
  mailId?: string // lien vers le courrier d'origine si applicable
  createdAt: Date
}

export interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  authorId: string
  category: 'news' | 'activity' | 'announcement' | 'event'
  status: 'draft' | 'published' | 'archived'
  featuredImage?: string
  images?: string[]
  videoUrl?: string
  tags: string[]
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PostComment {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: Date
}

export interface DashboardStats {
  visitsToday: {
    total: number
    waiting: number
    inProgress: number
    completed: number
  }
  packages: {
    pending: number
    urgent: number
    delivered: number
  }
  equipment: {
    needsCheck: number
    inMaintenance: number
    incidents: number
  }
  hse: {
    openIncidents: number
    trainingsThisWeek: number
    complianceRate: number
  }
}

// Types HSE étendus pour le module complet
export interface HSENotification extends Notification {
  type:
    | NotificationType
    | 'hse_training_expiring'
    | 'hse_incident_high'
    | 'hse_equipment_check'
    | 'hse_compliance_alert'
  metadata: {
    employeeId?: string
    trainingId?: string
    incidentId?: string
    equipmentId?: string
    daysUntilExpiry?: number
    complianceRate?: number
  }
}

export interface ComplianceData {
  service: string
  complianceRate: number
  expiredTrainings: number
  employeesCount: number
}

export interface TimelineEvent {
  date: Date
  action: string
  user: string
  details?: string
}

export interface EmployeeCompliance {
  employeeId: string
  totalRequired: number
  completed: number
  expired: number
  missing: number
  rate: number
}

export interface HSEStats {
  incidents: {
    open: number
    resolved: number
    thisMonth: number
    highSeverity: number
  }
  trainings: {
    scheduled: number
    completed: number
    compliance: number
    upcomingTrainings: number
  }
  audits: {
    planned: number
    inProgress: number
    findings: number
    nonconformities: number
  }
}

export type HSEContentType =
  | 'training'
  | 'alert'
  | 'info'
  | 'document'
  | 'procedure'
  | 'equipment_check'
  | 'quiz'
  | 'reminder'

export interface HSEContentItem {
  id: string
  type: HSEContentType
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  trainingId?: string
  documentUrl?: string
  documentName?: string
  procedureSteps?: string[]
  quizQuestions?: any[]
  alertMessage?: string
  createdBy: string
  createdAt: Date
  validUntil?: Date
  targetServices?: string[]
  targetRoles?: UserRole[]
  targetEmployees?: string[]
}

export type HSEAssignmentStatus =
  | 'sent'
  | 'received'
  | 'read'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'acknowledged'

export interface HSEAssignment {
  id: string
  contentId: string
  contentType: HSEContentType
  employeeId: string
  status: HSEAssignmentStatus
  assignedAt: Date
  dueDate?: Date
  reminderDate?: Date
  readAt?: Date
  startedAt?: Date
  completedAt?: Date
  acknowledgedAt?: Date
  progress?: number
  score?: number
  certificate?: string
  sentBy: string
  notes?: string
  metadata?: Record<string, any>
}

// ============================================
// GESTION PLANNING ET VACATIONS
// ============================================

export type VacationType =
  | 'SHIFT_12H_DAY' // 7h-19h Poste jour 12h
  | 'SHIFT_12H_NIGHT' // 19h-7h Poste nuit 12h
  | 'SHIFT_8H_MORNING' // 6h-14h Matin
  | 'SHIFT_8H_AFTERNOON' // 14h-22h Après-midi
  | 'SHIFT_8H_NIGHT' // 22h-6h Nuit
  | 'CUSTOM' // Personnalisé

export type VacationStatus =
  | 'PLANNED' // Planifiée
  | 'CONFIRMED' // Confirmée
  | 'IN_PROGRESS' // En cours
  | 'COMPLETED' // Terminée
  | 'CANCELLED' // Annulée
  | 'ABSENT' // Absent

export interface Vacation {
  id: string
  date: Date
  type: VacationType
  startTime: Date
  endTime: Date
  status: VacationStatus
  employeeId: string
  siteId: string
  siteName?: string
  plannedHours: number
  actualHours?: number
  overtimeHours?: number
  nightHours?: number
  checkInTime?: Date
  checkOutTime?: Date
  isValidated: boolean
  validatedBy?: string
  validatedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Site {
  id: string
  name: string
  code: string
  address: string
  department?: string
  minEmployeesDay: number
  minEmployeesNight: number
  is24h7: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Availability {
  id: string
  employeeId: string
  startDate: Date
  endDate: Date
  isAvailable: boolean
  reason?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// GESTION PAIE
// ============================================

export type PayslipStatus =
  | 'DRAFT' // Brouillon
  | 'PENDING' // En attente
  | 'VALIDATED' // Validée
  | 'PAID' // Payée
  | 'CANCELLED' // Annulée

export interface Payslip {
  id: string
  month: number
  year: number
  periodStart: Date
  periodEnd: Date
  employeeId: string
  baseSalary: number
  grossSalary: number
  netSalary: number
  totalHours: number
  overtimeHours: number
  nightHours: number
  overtimePay: number
  nightPay: number
  hazardPay: number
  transportAllowance: number
  mealAllowance: number
  otherBonuses: number
  socialSecurity: number
  incomeTax: number
  otherDeductions: number
  status: PayslipStatus
  generatedAt: Date
  validatedAt?: Date
  validatedBy?: string
  paidAt?: Date
  pdfUrl?: string
  items: PayslipItem[]
  createdAt: Date
  updatedAt: Date
}

export interface PayslipItem {
  id: string
  payslipId: string
  vacationId?: string
  date: Date
  description: string
  hours: number
  rate: number
  amount: number
  type: 'regular' | 'overtime' | 'night' | 'bonus' | 'weekend'
  createdAt: Date
}

export interface PayrollConfig {
  overtimeMultiplier: number // 1.5 (150%)
  nightMultiplier: number // 1.25 (125%)
  hazardMultiplier: number // 1.15 (115% risque raffinerie)
  weekendMultiplier: number // 1.5 (150%)
  socialSecurityRate: number // 15%
  incomeTaxRate: number // 20%
  transportAllowance: number // Montant fixe
  mealAllowancePerDay: number // Par jour travaillé
}

// ============================================
// GESTION ÉVALUATIONS / TESTS D'HABILITATION
// ============================================

export type AssessmentType =
  | 'PRE_HIRING' // Test pré-embauche
  | 'HABILITATION' // Test d'habilitation
  | 'EXTERNAL_ACCESS' // Accès externe raffinerie
  | 'QUALIFICATION' // Qualification technique
  | 'SAFETY_TEST' // Test sécurité obligatoire

export type QuestionType =
  | 'multiple_choice' // QCM
  | 'true_false' // Vrai/Faux
  | 'short_text' // Réponse courte
  | 'long_text' // Réponse longue
  | 'practical' // Épreuve pratique

export type AssessmentStatus =
  | 'draft' // Brouillon (création HSE)
  | 'published' // Publiée (prête à être envoyée)
  | 'assigned' // Assignée à candidat(s)
  | 'in_progress' // En cours par candidat
  | 'submitted' // Soumise (attente correction)
  | 'corrected' // Corrigée
  | 'passed' // Réussie
  | 'failed' // Échouée

export interface AssessmentQuestion {
  id: string
  type: QuestionType
  question: string
  points: number
  options?: string[] // Pour QCM
  correctAnswer?: string | string[] // Réponse attendue (si auto-corrigeable)
  explanation?: string // Explication de la réponse
  requiresManualCorrection: boolean
  category?: string // Catégorie (sécurité, technique, etc.)
  attachmentUrl?: string // Image/schéma pour la question
}

export interface Assessment {
  id: string
  title: string
  description: string
  type: AssessmentType
  category: string
  duration: number // Durée en minutes
  passingScore: number // Score minimum pour réussir (%)
  totalPoints: number // Total des points
  questions: AssessmentQuestion[]
  isPublished: boolean
  createdBy: string // ID Responsable HSE
  createdAt: Date
  updatedAt: Date
  validityMonths?: number // Durée de validité du certificat
  certificateTemplate?: string
  instructions?: string // Instructions pour le candidat

  // Habilitation automatique
  grantsHabilitation?: string // Nom de l'habilitation accordée si réussite
  habilitationCode?: string // Code de l'habilitation
  habilitationDescription?: string
}

export interface CandidateAnswer {
  questionId: string
  answer: string | string[]
  answeredAt: Date
  timeSpent?: number // Temps passé sur la question (secondes)
}

export interface AssessmentSubmission {
  id: string
  assessmentId: string
  candidateId: string // ID candidat (employee ou visitor)
  candidateType: 'employee' | 'visitor' | 'external'
  status: AssessmentStatus

  // Réponses
  answers: CandidateAnswer[]

  // Timing
  assignedAt: Date
  startedAt?: Date
  submittedAt?: Date
  correctedAt?: Date

  // Résultats
  score?: number // Score obtenu (%)
  totalPoints?: number
  earnedPoints?: number
  isPassed?: boolean

  // Correction manuelle
  correctorId?: string // ID du correcteur (HSE)
  correctorComments?: string
  questionGrades?: QuestionGrade[]

  // Certificat
  certificateUrl?: string
  certificateIssuedAt?: Date
  expiryDate?: Date

  createdAt: Date
  updatedAt: Date
}

export interface QuestionGrade {
  questionId: string
  pointsEarned: number
  maxPoints: number
  feedback?: string // Commentaire du correcteur
  isCorrect: boolean
}

export interface ExternalCandidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  position: string
  idDocument: string
  documentType: 'cin' | 'passport' | 'other'
  purpose: string // Raison de l'accès (maintenance, audit, etc.)
  requestedBy?: string // Demandé par (employé SOGARA)
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  approvedBy?: string
  approvedAt?: Date
  validUntil?: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================
// PARCOURS DE CERTIFICATION (Formation → Évaluation → Habilitation)
// ============================================

export type CertificationPathStatus =
  | 'not_started' // Pas commencé
  | 'training_in_progress' // Formation en cours
  | 'training_completed' // Formation complétée
  | 'evaluation_available' // Évaluation disponible
  | 'evaluation_in_progress' // Évaluation en cours
  | 'evaluation_submitted' // Évaluation soumise
  | 'evaluation_corrected' // Évaluation corrigée
  | 'completed_passed' // Parcours réussi (habilitation accordée)
  | 'completed_failed' // Parcours échoué

export interface CertificationPath {
  id: string
  title: string
  description: string

  // Étape 1: Formation
  trainingModuleId: string // ID du module de formation
  trainingTitle: string
  trainingDuration: number // Heures

  // Étape 2: Évaluation
  assessmentId: string // ID de l'évaluation
  assessmentTitle: string
  daysBeforeAssessment: number // Délai entre formation et évaluation
  assessmentDuration: number // Minutes
  passingScore: number // Score minimum (%)

  // Étape 3: Habilitation
  habilitationName: string
  habilitationCode: string
  habilitationValidity: number // Mois

  // Métadonnées
  createdBy: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CertificationPathProgress {
  id: string
  pathId: string
  candidateId: string
  candidateType: 'employee' | 'external'
  status: CertificationPathStatus

  // Progression formation
  trainingAssignmentId?: string
  trainingStartedAt?: Date
  trainingCompletedAt?: Date
  trainingScore?: number

  // Progression évaluation
  assessmentSubmissionId?: string
  evaluationAvailableDate?: Date // Date calculée = trainingCompleted + daysBeforeAssessment
  evaluationStartedAt?: Date
  evaluationSubmittedAt?: Date
  evaluationCorrectedAt?: Date
  evaluationScore?: number
  evaluationPassed?: boolean

  // Habilitation
  habilitationGrantedAt?: Date
  habilitationExpiryDate?: Date
  certificateUrl?: string

  // Métadonnées
  assignedBy: string
  assignedAt: Date
  completedAt?: Date

  createdAt: Date
  updatedAt: Date
}
