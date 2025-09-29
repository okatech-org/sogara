export type UserRole = 'ADMIN' | 'RECEP' | 'HSE' | 'SUPERVISEUR' | 'EMPLOYE' | 'COMMUNICATION';

export type VisitStatus = 'expected' | 'waiting' | 'in_progress' | 'checked_out';
export type PackageStatus = 'received' | 'stored' | 'delivered';
export type EquipmentStatus = 'operational' | 'maintenance' | 'out_of_service';
export type Priority = 'normal' | 'urgent';
export type NotificationType = 'urgent' | 'warning' | 'info' | 'success';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  service: string;
  roles: UserRole[];
  competences: string[];
  habilitations: string[];
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  stats: {
    visitsReceived: number;
    packagesReceived: number;
    hseTrainingsCompleted: number;
  };
  equipmentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  idDocument: string;
  documentType: 'cin' | 'passport' | 'other';
  phone?: string;
  email?: string;
  photo?: string;
  createdAt: Date;
}

export interface Visit {
  id: string;
  visitorId: string;
  hostEmployeeId: string;
  scheduledAt: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  status: VisitStatus;
  purpose: string;
  notes?: string;
  badgeNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageMail {
  id: string;
  type: 'package' | 'mail';
  reference: string;
  sender: string;
  recipientEmployeeId?: string;
  recipientService?: string; // Pour les courriers adressés à un service
  description: string;
  photoUrl?: string;
  isConfidential?: boolean; // Courrier confidentiel: pas de scan
  scannedFileUrls?: string[]; // Courrier non confidentiel: fichiers scannés
  priority: Priority;
  status: PackageStatus;
  receivedAt: Date;
  deliveredAt?: Date;
  deliveredBy?: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  id: string;
  type: string;
  label: string;
  serialNumber?: string;
  holderEmployeeId?: string;
  status: EquipmentStatus;
  nextCheckDate?: Date;
  description?: string;
  location?: string;
  history: EquipmentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentHistory {
  id: string;
  equipmentId: string;
  employeeId?: string;
  action: 'assigned' | 'unassigned' | 'maintenance' | 'check' | 'incident';
  notes?: string;
  createdAt: Date;
}

export interface HSEIncident {
  id: string;
  employeeId: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: string;
  occurredAt: Date;
  status: 'reported' | 'investigating' | 'resolved';
  attachments?: string[];
  reportedBy: string;
  investigatedBy?: string;
  correctiveActions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HSETraining {
  id: string;
  title: string;
  description: string;
  requiredForRoles: UserRole[];
  duration: number;
  validityMonths: number;
  sessions: HSETrainingSession[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HSETrainingModule {
  id: string;
  code: string;
  title: string;
  category: 'Critique' | 'Obligatoire' | 'Spécialisée' | 'Management' | 'Prévention';
  description: string;
  objectives: string[];
  duration: number;
  durationUnit: 'heures' | 'minutes' | 'jours';
  validityMonths: number;
  requiredForRoles: UserRole[];
  prerequisites: string[];
  certification: {
    examRequired: boolean;
    passingScore: number | null;
    practicalTest: boolean;
    certificateType: string;
  };
  instructor: {
    qualificationRequired: string;
    minExperience: string;
  };
  maxParticipants: number;
  language: string[];
  deliveryMethods: string[];
  refresherRequired: boolean;
  refresherFrequency: number;
  content: HSETrainingContent;
}

export interface HSETrainingContent {
  modules: HSEContentModule[];
  resources: HSETrainingResource[];
  assessments: HSEAssessment[];
}

export interface HSEContentModule {
  id: string;
  title: string;
  duration: number;
  description: string;
  content: HSEModuleSection[];
  illustrations?: HSEIllustration[];
}

export interface HSEModuleSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'checklist' | 'case_study' | 'procedure' | 'safety_rules' | 'emergency_protocol';
  illustrations?: HSEIllustration[];
  interactive?: HSEInteractiveElement[];
}

export interface HSEIllustration {
  id: string;
  type: 'diagram' | 'photo' | 'schema' | 'infographic' | 'chart';
  title: string;
  description: string;
  url: string;
  alt: string;
}

export interface HSEInteractiveElement {
  id: string;
  type: 'quiz' | 'simulation' | 'checklist' | 'video' | 'animation';
  title: string;
  content: any;
}

export interface HSETrainingResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'document' | 'link' | 'checklist';
  url: string;
  description: string;
  downloadable: boolean;
}

export interface HSEAssessment {
  id: string;
  title: string;
  type: 'qcm' | 'practical' | 'case_study';
  questions: HSEQuestion[];
  passingScore: number;
  duration: number;
}

export interface HSEQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'open';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  illustration?: HSEIllustration;
}

export interface HSETrainingProgress {
  id: string;
  employeeId: string;
  trainingModuleId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  currentModule?: string;
  completedModules: string[];
  assessmentResults: HSEAssessmentResult[];
  startedAt?: Date;
  completedAt?: Date;
  certificateIssuedAt?: Date;
  expiresAt?: Date;
}

export interface HSEAssessmentResult {
  assessmentId: string;
  score: number;
  passed: boolean;
  attempts: number;
  completedAt: Date;
  answers: any[];
}

export interface HSETrainingSession {
  id: string;
  trainingId: string;
  date: Date;
  instructor: string;
  location: string;
  maxParticipants: number;
  attendance: HSEAttendance[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface HSEAttendance {
  employeeId: string;
  status: 'registered' | 'present' | 'absent' | 'completed';
  score?: number;
  certificationDate?: Date;
  expirationDate?: Date;
  notes?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'destructive';
}

export interface FolderDocument {
  id: string;
  ownerType: 'employee' | 'service';
  ownerId?: string; // requis si ownerType = 'employee'
  serviceName?: string; // requis si ownerType = 'service'
  source: 'mail' | 'package' | 'manual';
  name: string;
  url: string; // Data URL ou URL distante
  mailId?: string; // lien vers le courrier d'origine si applicable
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  category: 'news' | 'activity' | 'announcement' | 'event';
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  images?: string[];
  videoUrl?: string;
  tags: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface DashboardStats {
  visitsToday: {
    total: number;
    waiting: number;
    inProgress: number;
    completed: number;
  };
  packages: {
    pending: number;
    urgent: number;
    delivered: number;
  };
  equipment: {
    needsCheck: number;
    inMaintenance: number;
    incidents: number;
  };
  hse: {
    openIncidents: number;
    trainingsThisWeek: number;
    complianceRate: number;
  };
}

// Types HSE étendus pour le module complet
export interface HSENotification extends Notification {
  type: NotificationType | 'hse_training_expiring' | 'hse_incident_high' | 'hse_equipment_check' | 'hse_compliance_alert';
  metadata: {
    employeeId?: string;
    trainingId?: string;
    incidentId?: string;
    equipmentId?: string;
    daysUntilExpiry?: number;
    complianceRate?: number;
  };
}

export interface ComplianceData {
  service: string;
  complianceRate: number;
  expiredTrainings: number;
  employeesCount: number;
}

export interface TimelineEvent {
  date: Date;
  action: string;
  user: string;
  details?: string;
}

export interface EmployeeCompliance {
  employeeId: string;
  totalRequired: number;
  completed: number;
  expired: number;
  missing: number;
  rate: number;
}

export interface HSEStats {
  incidents: {
    open: number;
    resolved: number;
    thisMonth: number;
    highSeverity: number;
  };
  trainings: {
    scheduled: number;
    completed: number;
    compliance: number;
    upcomingTrainings: number;
  };
  equipment: {
    needsInspection: number;
    operational: number;
    maintenance: number;
  };
}