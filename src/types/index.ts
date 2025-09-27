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
  recipientEmployeeId: string;
  description: string;
  photoUrl?: string;
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