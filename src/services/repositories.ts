import { 
  Employee, 
  Visitor, 
  Visit, 
  PackageMail, 
  Equipment, 
  HSEIncident, 
  HSETraining, 
  Notification,
  DashboardStats,
  UserRole,
  Post,
  PostComment,
  EquipmentHistory,
  FolderDocument
} from '@/types';

import sogaraCompanyImage from '@/assets/sogara-company.jpg';
import isoCertificationImage from '@/assets/iso-certification.jpg';
import safetyTrainingImage from '@/assets/safety-training.jpg';
import raffinerieModerneImage from '@/assets/raffinerie-moderne.jpg';
import equipeDeveloppementDurableImage from '@/assets/equipe-developpement-durable.jpg';
import resultatsEntrepriseImage from '@/assets/resultats-entreprise.jpg';
import formationSecuriteImage from '@/assets/formation-securite.jpg';
import communicationEntrepriseImage from '@/assets/communication-entreprise.jpg';

const STORAGE_KEYS = {
  EMPLOYEES: 'sogara_employees',
  VISITORS: 'sogara_visitors',
  VISITS: 'sogara_visits',
  PACKAGES: 'sogara_packages',
  EQUIPMENT: 'sogara_equipment',
  HSE_INCIDENTS: 'sogara_hse_incidents',
  HSE_TRAININGS: 'sogara_hse_trainings',
  NOTIFICATIONS: 'sogara_notifications',
  POSTS: 'sogara_posts',
  DOCUMENTS: 'sogara_documents',
};

function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data, (key, value) => {
    if (key.includes('At') || key.includes('Date')) {
      return new Date(value);
    }
    return value;
  }) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export class EmployeeRepository {
  private employees: Employee[] = [];

  constructor() {
    this.employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
    if (this.employees.length === 0) {
      this.seedData();
    } else {
      // Migration de cohérence des comptes (corrige anciens jeux de données en cache)
      this.migrateEmployees();
      // If storage was partially seeded in previous versions, ensure all demo accounts exist
      this.ensureDemoEmployees();
    }
  }

  private seedData(): void {
    const sampleEmployees: Employee[] = [
      {
        id: '1',
        firstName: 'Pierre',
        lastName: 'BEKALE',
        matricule: 'EMP001',
        service: 'Production',
        roles: ['EMPLOYE'],
        competences: ['Opérateur', 'Sécurité niveau 1'],
        habilitations: ['Conduite', 'EPI obligatoire'],
        email: 'pierre.bekale@sogara.com',
        status: 'active',
        stats: { visitsReceived: 5, packagesReceived: 2, hseTrainingsCompleted: 3 },
        equipmentIds: ['eq1', 'eq2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        firstName: 'Sylvie',
        lastName: 'KOUMBA',
        matricule: 'REC001',
        service: 'Sécurité',
        roles: ['RECEP'],
        competences: ['Gestion sécurité', 'Accueil visiteurs', 'Gestion colis'],
        habilitations: ['Badge visiteurs', 'Système accès', 'Contrôle sécurité'],
        email: 'sylvie.koumba@sogara.com',
        status: 'active',
        stats: { visitsReceived: 15, packagesReceived: 8, hseTrainingsCompleted: 4 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        firstName: 'PELLEN',
        lastName: 'Asted',
        matricule: 'ADM001',
        service: 'ORGANEUS Gabon',
        roles: ['ADMIN'],
        competences: ['Administration systèmes', 'Sécurité informatique', 'Supervision'],
        habilitations: ['Accès total', 'Configuration système'],
        email: 'pellen.asted@organeus.ga',
        status: 'active',
        stats: { visitsReceived: 3, packagesReceived: 1, hseTrainingsCompleted: 8 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        firstName: 'Marie-Claire',
        lastName: 'NZIEGE',
        matricule: 'HSE001',
        service: 'HSE et Conformité',
        roles: ['HSE', 'COMPLIANCE', 'SECURITE'],
        competences: ['Sécurité industrielle', 'Formation HSE', 'Audit conformité', 'Gestion sécurité', 'Conformité réglementaire'],
        habilitations: ['Inspection sécurité', 'Formation obligatoire', 'Incident management', 'Gestion réception'],
        email: 'marie-claire.nziege@sogara.com',
        status: 'active',
        stats: { visitsReceived: 8, packagesReceived: 3, hseTrainingsCompleted: 12 },
        equipmentIds: ['eq3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '6',
        firstName: 'Clarisse',
        lastName: 'MBOUMBA',
        matricule: 'COM001',
        service: 'Communication',
        roles: ['COMMUNICATION'],
        competences: ['Communication interne', 'Rédaction', 'Réseaux sociaux', 'Relations presse', 'Gestion SOGARA Connect'],
        habilitations: ['Diffusion information', 'Gestion événements', 'Gestion contenu'],
        email: 'clarisse.mboumba@sogara.com',
        status: 'active',
        stats: { visitsReceived: 4, packagesReceived: 2, hseTrainingsCompleted: 5 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '7',
        firstName: 'Daniel',
        lastName: 'MVOU',
        matricule: 'DG001',
        service: 'Direction Générale',
        roles: ['DG', 'ADMIN'],
        competences: ['Direction générale', 'Stratégie', 'Management', 'Pilotage entreprise', 'Relations institutionnelles'],
        habilitations: ['Accès total', 'Décisions stratégiques', 'Représentation légale'],
        email: 'daniel.mvou@sogara.com',
        status: 'active',
        stats: { visitsReceived: 10, packagesReceived: 5, hseTrainingsCompleted: 10 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '8',
        firstName: 'Brigitte',
        lastName: 'NGUEMA',
        matricule: 'DRH001',
        service: 'Ressources Humaines',
        roles: ['DRH', 'ADMIN'],
        competences: ['Gestion RH', 'Recrutement', 'Formation', 'Développement compétences', 'Relations sociales'],
        habilitations: ['Gestion personnel', 'Validation formations', 'Administration RH'],
        email: 'brigitte.nguema@sogara.com',
        status: 'active',
        stats: { visitsReceived: 7, packagesReceived: 4, hseTrainingsCompleted: 9 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    this.employees = sampleEmployees;
    this.save();
  }

  // Corrige les incohérences éventuelles dans le cache local (noms obsolètes, doublons, etc.)
  private migrateEmployees(): void {
    let changed = false;

    // 1) Supprimer les comptes obsolètes/doublons
    const before = this.employees.length;
    this.employees = this.employees.filter(e => e.matricule !== 'COM002');
    if (this.employees.length !== before) changed = true;

    // 2) Canonicaliser les fiches par matricule
    const canonicalByMatricule: Record<string, Partial<Employee>> = {
      'COM001': {
        firstName: 'Clarisse',
        lastName: 'MBOUMBA',
        service: 'Communication',
        roles: ['COMMUNICATION'],
        email: 'clarisse.mboumba@sogara.com'
      },
      'HSE001': {
        firstName: 'Marie-Claire',
        lastName: 'NZIEGE',
        service: 'HSE et Conformité',
        roles: ['HSE', 'COMPLIANCE', 'SECURITE'],
        email: 'marie-claire.nziege@sogara.com'
      },
      'ADM001': {
        firstName: 'PELLEN',
        lastName: 'Asted',
        service: 'ORGANEUS Gabon',
        roles: ['ADMIN'],
        email: 'pellen.asted@organeus.ga'
      },
      'EMP001': {
        firstName: 'Pierre',
        lastName: 'BEKALE',
        service: 'Production',
        roles: ['EMPLOYE'],
        email: 'pierre.bekale@sogara.com'
      },
      'REC001': {
        firstName: 'Sylvie',
        lastName: 'KOUMBA',
        service: 'Sécurité',
        roles: ['RECEP'],
        email: 'sylvie.koumba@sogara.com'
      },
      'DG001': {
        firstName: 'Daniel',
        lastName: 'MVOU',
        service: 'Direction Générale',
        roles: ['DG', 'ADMIN'],
        email: 'daniel.mvou@sogara.com'
      },
      'DRH001': {
        firstName: 'Brigitte',
        lastName: 'NGUEMA',
        service: 'Ressources Humaines',
        roles: ['DRH', 'ADMIN'],
        email: 'brigitte.nguema@sogara.com'
      }
    };

    this.employees = this.employees.map(e => {
      const canon = canonicalByMatricule[e.matricule];
      if (canon) {
        const updated: Employee = { ...e, ...canon } as Employee;
        if (
          updated.firstName !== e.firstName ||
          updated.lastName !== e.lastName ||
          updated.service !== e.service ||
          updated.email !== e.email ||
          JSON.stringify(updated.roles) !== JSON.stringify(e.roles)
        ) {
          changed = true;
        }
        return updated;
      }
      return e;
    });

    if (changed) this.save();
  }

  // Ensure demo employees exist even if storage was partially seeded
  private ensureDemoEmployees(): void {
    const sampleEmployees: Employee[] = [
      {
        id: '1',
        firstName: 'Pierre',
        lastName: 'BEKALE',
        matricule: 'EMP001',
        service: 'Production',
        roles: ['EMPLOYE'],
        competences: ['Opérateur', 'Sécurité niveau 1'],
        habilitations: ['Conduite', 'EPI obligatoire'],
        email: 'pierre.bekale@sogara.com',
        status: 'active',
        stats: { visitsReceived: 5, packagesReceived: 2, hseTrainingsCompleted: 3 },
        equipmentIds: ['eq1', 'eq2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        firstName: 'Sylvie',
        lastName: 'KOUMBA',
        matricule: 'REC001',
        service: 'Sécurité',
        roles: ['RECEP'],
        competences: ['Gestion sécurité', 'Accueil visiteurs', 'Gestion colis'],
        habilitations: ['Badge visiteurs', 'Système accès', 'Contrôle sécurité'],
        email: 'sylvie.koumba@sogara.com',
        status: 'active',
        stats: { visitsReceived: 15, packagesReceived: 8, hseTrainingsCompleted: 4 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        firstName: 'PELLEN',
        lastName: 'Asted',
        matricule: 'ADM001',
        service: 'ORGANEUS Gabon',
        roles: ['ADMIN'],
        competences: ['Administration systèmes', 'Sécurité informatique', 'Supervision'],
        habilitations: ['Accès total', 'Configuration système'],
        email: 'pellen.asted@organeus.ga',
        status: 'active',
        stats: { visitsReceived: 3, packagesReceived: 1, hseTrainingsCompleted: 8 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        firstName: 'Marie-Claire',
        lastName: 'NZIEGE',
        matricule: 'HSE001',
        service: 'HSE et Conformité',
        roles: ['HSE', 'COMPLIANCE', 'SECURITE'],
        competences: ['Sécurité industrielle', 'Formation HSE', 'Audit conformité', 'Gestion sécurité', 'Conformité réglementaire'],
        habilitations: ['Inspection sécurité', 'Formation obligatoire', 'Incident management', 'Gestion réception'],
        email: 'marie-claire.nziege@sogara.com',
        status: 'active',
        stats: { visitsReceived: 8, packagesReceived: 3, hseTrainingsCompleted: 12 },
        equipmentIds: ['eq3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '6',
        firstName: 'Clarisse',
        lastName: 'MBOUMBA',
        matricule: 'COM001',
        service: 'Communication',
        roles: ['COMMUNICATION'],
        competences: ['Communication interne', 'Rédaction', 'Réseaux sociaux', 'Relations presse', 'Gestion SOGARA Connect'],
        habilitations: ['Diffusion information', 'Gestion événements', 'Gestion contenu'],
        email: 'clarisse.mboumba@sogara.com',
        status: 'active',
        stats: { visitsReceived: 4, packagesReceived: 2, hseTrainingsCompleted: 5 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '7',
        firstName: 'Daniel',
        lastName: 'MVOU',
        matricule: 'DG001',
        service: 'Direction Générale',
        roles: ['DG', 'ADMIN'],
        competences: ['Direction générale', 'Stratégie', 'Management', 'Pilotage entreprise', 'Relations institutionnelles'],
        habilitations: ['Accès total', 'Décisions stratégiques', 'Représentation légale'],
        email: 'daniel.mvou@sogara.com',
        status: 'active',
        stats: { visitsReceived: 10, packagesReceived: 5, hseTrainingsCompleted: 10 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '8',
        firstName: 'Brigitte',
        lastName: 'NGUEMA',
        matricule: 'DRH001',
        service: 'Ressources Humaines',
        roles: ['DRH', 'ADMIN'],
        competences: ['Gestion RH', 'Recrutement', 'Formation', 'Développement compétences', 'Relations sociales'],
        habilitations: ['Gestion personnel', 'Validation formations', 'Administration RH'],
        email: 'brigitte.nguema@sogara.com',
        status: 'active',
        stats: { visitsReceived: 7, packagesReceived: 4, hseTrainingsCompleted: 9 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '10',
        firstName: 'Jean-Luc',
        lastName: 'BERNARD',
        matricule: 'EXT001',
        service: 'Total Energies Gabon',
        roles: ['EXTERNE'],
        competences: ['Maintenance compresseurs', 'Hydraulique', 'Automatisme'],
        habilitations: [],
        email: 'jl.bernard@totalenergies.com',
        phone: '+241 06 12 34 56',
        status: 'active',
        stats: { visitsReceived: 0, packagesReceived: 0, hseTrainingsCompleted: 0 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    let added = false;
    for (const demo of sampleEmployees) {
      if (!this.employees.find(e => e.id === demo.id)) {
        this.employees.push(demo);
        added = true;
      }
    }
    if (added) this.save();
  }

  private save(): void {
    saveToStorage(STORAGE_KEYS.EMPLOYEES, this.employees);
  }

  getAll(): Employee[] {
    return this.employees;
  }

  getById(id: string): Employee | undefined {
    return this.employees.find(emp => emp.id === id);
  }

  create(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.employees.push(newEmployee);
    this.save();
    return newEmployee;
  }

  update(id: string, updates: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return null;

    this.employees[index] = {
      ...this.employees[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.save();
    return this.employees[index];
  }

  delete(id: string): boolean {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return false;

    this.employees.splice(index, 1);
    this.save();
    return true;
  }

  getByRole(role: UserRole): Employee[] {
    return this.employees.filter(emp => emp.roles.includes(role));
  }
}

export class VisitorRepository {
  private visitors: Visitor[] = [];

  constructor() {
    this.visitors = getFromStorage<Visitor>(STORAGE_KEYS.VISITORS);
  }

  private save(): void {
    saveToStorage(STORAGE_KEYS.VISITORS, this.visitors);
  }

  getAll(): Visitor[] {
    return this.visitors;
  }

  getById(id: string): Visitor | undefined {
    return this.visitors.find(v => v.id === id);
  }

  create(visitor: Omit<Visitor, 'id' | 'createdAt'>): Visitor {
    const newVisitor: Visitor = {
      ...visitor,
      id: generateId(),
      createdAt: new Date(),
    };
    this.visitors.push(newVisitor);
    this.save();
    return newVisitor;
  }

  searchByName(name: string): Visitor[] {
    const search = name.toLowerCase();
    return this.visitors.filter(v => 
      v.firstName.toLowerCase().includes(search) || 
      v.lastName.toLowerCase().includes(search)
    );
  }
}

export class VisitRepository {
  private visits: Visit[] = [];

  constructor() {
    this.visits = getFromStorage<Visit>(STORAGE_KEYS.VISITS);
  }

  private save(): void {
    saveToStorage(STORAGE_KEYS.VISITS, this.visits);
  }

  getAll(): Visit[] {
    return this.visits;
  }

  getById(id: string): Visit | undefined {
    return this.visits.find(v => v.id === id);
  }

  create(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Visit {
    const newVisit: Visit = {
      ...visit,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.visits.push(newVisit);
    this.save();
    return newVisit;
  }

  update(id: string, updates: Partial<Visit>): Visit | null {
    const index = this.visits.findIndex(v => v.id === id);
    if (index === -1) return null;

    this.visits[index] = {
      ...this.visits[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.save();
    return this.visits[index];
  }

  getByDate(date: Date): Visit[] {
    const targetDate = date.toDateString();
    return this.visits.filter(v => v.scheduledAt.toDateString() === targetDate);
  }

  getByHostEmployee(employeeId: string): Visit[] {
    return this.visits.filter(v => v.hostEmployeeId === employeeId);
  }

  getTodaysStats() {
    const today = new Date().toDateString();
    const todayVisits = this.visits.filter(v => v.scheduledAt.toDateString() === today);
    
    return {
      total: todayVisits.length,
      waiting: todayVisits.filter(v => v.status === 'waiting').length,
      inProgress: todayVisits.filter(v => v.status === 'in_progress').length,
      completed: todayVisits.filter(v => v.status === 'checked_out').length,
    };
  }
}

export class PackageRepository {
  private packages: PackageMail[] = [];

  constructor() {
    this.packages = getFromStorage<PackageMail>(STORAGE_KEYS.PACKAGES);
  }

  private save(): void {
    saveToStorage(STORAGE_KEYS.PACKAGES, this.packages);
  }

  getAll(): PackageMail[] {
    return this.packages;
  }

  getById(id: string): PackageMail | undefined {
    return this.packages.find(p => p.id === id);
  }

  create(packageMail: Omit<PackageMail, 'id' | 'createdAt' | 'updatedAt'>): PackageMail {
    const newPackage: PackageMail = {
      ...packageMail,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.packages.push(newPackage);
    this.save();
    return newPackage;
  }

  update(id: string, updates: Partial<PackageMail>): PackageMail | null {
    const index = this.packages.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.packages[index] = {
      ...this.packages[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.save();
    return this.packages[index];
  }

  getStats() {
    return {
      pending: this.packages.filter(p => p.status !== 'delivered').length,
      urgent: this.packages.filter(p => p.priority === 'urgent' && p.status !== 'delivered').length,
      delivered: this.packages.filter(p => p.status === 'delivered').length,
    };
  }
}

export class DocumentRepository {
  private documents: FolderDocument[] = [];

  constructor() {
    this.documents = getFromStorage<FolderDocument>(STORAGE_KEYS.DOCUMENTS);
  }

  private save(): void {
    saveToStorage(STORAGE_KEYS.DOCUMENTS, this.documents);
  }

  getAll(): FolderDocument[] {
    return this.documents;
  }

  getByOwner(ownerType: 'employee' | 'service', ownerIdOrService?: string): FolderDocument[] {
    if (ownerType === 'employee') {
      return this.documents.filter(d => d.ownerType === 'employee' && d.ownerId === ownerIdOrService);
    }
    return this.documents.filter(d => d.ownerType === 'service' && d.serviceName === ownerIdOrService);
  }

  create(doc: Omit<FolderDocument, 'id' | 'createdAt'>): FolderDocument {
    const newDoc: FolderDocument = {
      ...doc,
      id: generateId(),
      createdAt: new Date(),
    };
    this.documents.push(newDoc);
    this.save();
    return newDoc;
  }
}

export class EquipmentRepository {
  private equipment: Equipment[] = [];

  constructor() {
    this.equipment = getFromStorage<Equipment>(STORAGE_KEYS.EQUIPMENT);
    if (this.equipment.length === 0) {
      this.seedData();
    }
  }

  private seedData(): void {
    const sampleEquipment: Equipment[] = [
      {
        id: 'eq1',
        type: 'EPI',
        label: 'Casque de sécurité',
        serialNumber: 'CSQ001',
        holderEmployeeId: '1',
        status: 'operational',
        nextCheckDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: 'Casque de protection jaune',
        location: 'Zone Production',
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    this.equipment = sampleEquipment;
    this.save();
  }

  private save(): void {
    saveToStorage(STORAGE_KEYS.EQUIPMENT, this.equipment);
  }

  getAll(): Equipment[] {
    return this.equipment;
  }

  getById(id: string): Equipment | undefined {
    return this.equipment.find(eq => eq.id === id);
  }

  create(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Equipment {
    const newEquipment: Equipment = {
      ...equipment,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.equipment.push(newEquipment);
    this.save();
    return newEquipment;
  }

  update(id: string, updates: Partial<Equipment>): Equipment | null {
    const index = this.equipment.findIndex(eq => eq.id === id);
    if (index === -1) return null;

    this.equipment[index] = {
      ...this.equipment[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.save();
    return this.equipment[index];
  }

  getByEmployee(employeeId: string): Equipment[] {
    return this.equipment.filter(eq => eq.holderEmployeeId === employeeId);
  }

  getStats() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      needsCheck: this.equipment.filter(eq => 
        eq.nextCheckDate && eq.nextCheckDate <= nextWeek
      ).length,
      inMaintenance: this.equipment.filter(eq => eq.status === 'maintenance').length,
      incidents: 0, // À implémenter avec les incidents HSE
    };
  }
}

export class NotificationRepository {
  private notifications: Notification[] = [];

  constructor() {
    const stored = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    // Convertir les timestamps strings en Date
    this.notifications = stored.map(notif => ({
      ...notif,
      timestamp: typeof notif.timestamp === 'string' 
        ? new Date(notif.timestamp) 
        : notif.timestamp instanceof Date 
          ? notif.timestamp 
          : new Date()
    }));
  }

  private save(): void {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  getAll(): Notification[] {
    return this.notifications.sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  }

  create(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };
    this.notifications.push(newNotification);
    this.save();
    return newNotification;
  }

  markAsRead(id: string): boolean {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;

    this.notifications[index].read = true;
    this.save();
    return true;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}

// Post repository for SOGARA Connect
export class PostRepository {
  private posts: Post[] = [];

  constructor() {
    this.posts = getFromStorage<Post>(STORAGE_KEYS.POSTS);
    if (this.posts.length === 0) {
      this.seedData();
    } else {
      this.fixLegacyMediaUrls();
    }
  }

  private seedData(): void {
    const samplePosts: Post[] = [
      {
        id: '1',
        title: 'Nouvelle certification ISO 14001 obtenue',
        content: 'SOGARA a obtenu la certification ISO 14001 pour son système de management environnemental. Cette certification témoigne de notre engagement continu pour la protection de l\'environnement et l\'amélioration de nos performances environnementales. Cette reconnaissance internationale valide nos efforts constants pour minimiser notre impact environnemental tout en maintenant l\'excellence opérationnelle.',
        excerpt: 'Une nouvelle certification qui témoigne de notre engagement pour l\'environnement.',
        authorId: '6', // Communication manager
        category: 'news',
        status: 'published',
        featuredImage: isoCertificationImage,
        images: [isoCertificationImage],
        tags: ['ISO', 'Environnement', 'Certification'],
        publishedAt: new Date('2024-01-20'),
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: '2',
        title: 'Journée sécurité - 15 février 2024',
        content: 'Participez à notre journée dédiée à la sécurité au travail. Au programme : formations pratiques, ateliers de sensibilisation, démonstrations d\'équipements de protection individuelle et échanges avec nos experts HSE. Cette journée s\'adresse à tous les employés et vise à renforcer notre culture sécurité. Rendez-vous à 8h00 dans l\'auditorium principal.',
        excerpt: 'Une journée complète dédiée à la sensibilisation et formation sécurité.',
        authorId: '6',
        category: 'event',
        status: 'published',
        featuredImage: formationSecuriteImage,
        images: [formationSecuriteImage],
        tags: ['Sécurité', 'Formation', 'HSE'],
        publishedAt: new Date('2024-01-18'),
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-18'),
      },
      {
        id: '3',
        title: 'Résultats exceptionnels du T4 2023',
        content: 'SOGARA annonce des résultats record pour le quatrième trimestre 2023, confirmant la solidité et la croissance soutenue de notre entreprise. Ces performances exceptionnelles sont le fruit de l\'engagement de tous nos collaborateurs et de notre stratégie d\'investissement dans les technologies innovantes. Nous remercions chaleureusement toutes les équipes pour leur dévouement.',
        excerpt: 'Des performances qui confirment la solidité de notre entreprise.',
        authorId: '6',
        category: 'announcement',
        status: 'published',
        featuredImage: resultatsEntrepriseImage,
        images: [resultatsEntrepriseImage],
        tags: ['Résultats', 'Performance', 'T4 2023'],
        publishedAt: new Date('2024-01-16'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        id: '4',
        title: 'Nouvelle équipe projet développement durable',
        content: 'SOGARA constitue une équipe dédiée au développement durable pour piloter nos initiatives écologiques. Cette équipe pluridisciplinaire travaillera sur la réduction de notre empreinte carbone, l\'optimisation de nos processus industriels et le développement de nouvelles technologies vertes.',
        excerpt: 'Une équipe dédiée pour accélérer notre transition écologique.',
        authorId: '6',
        category: 'activity',
        status: 'published',
        featuredImage: equipeDeveloppementDurableImage,
        images: [equipeDeveloppementDurableImage],
        tags: ['Développement durable', 'Écologie', 'Innovation'],
        publishedAt: new Date('2024-01-14'),
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-14'),
      },
    ];

    this.posts = samplePosts;
    this.save();
  }

  // Nettoyage des anciennes URLs non persistantes (blob:)
  private fixLegacyMediaUrls(): void {
    let changed = false;
    this.posts = this.posts.map((p) => {
      const isValid = (src?: string) => !!src && !src.startsWith('blob:');
      const updated = { ...p } as Post;
      if (!isValid(updated.featuredImage)) {
        updated.featuredImage = undefined;
        changed = true;
      }
      if (updated.images) {
        const imgs = updated.images.filter(isValid);
        if (imgs.length !== updated.images.length) {
          updated.images = imgs.length ? imgs : undefined;
          if (!updated.featuredImage && imgs.length) updated.featuredImage = imgs[0];
          changed = true;
        }
      }
      return updated;
    });
    if (changed) this.save();
  }

  private save(): void {
    saveToStorage(STORAGE_KEYS.POSTS, this.posts);
  }

  getAll(): Post[] {
    return this.posts.sort((a, b) => 
      new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    );
  }

  getById(id: string): Post | undefined {
    return this.posts.find(post => post.id === id);
  }

  create(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post {
    const newPost: Post = {
      ...post,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.push(newPost);
    this.save();
    return newPost;
  }

  update(id: string, updates: Partial<Post>): Post | null {
    const index = this.posts.findIndex(post => post.id === id);
    if (index === -1) return null;

    this.posts[index] = {
      ...this.posts[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.save();
    return this.posts[index];
  }

  delete(id: string): boolean {
    const index = this.posts.findIndex(post => post.id === id);
    if (index === -1) return false;

    this.posts.splice(index, 1);
    this.save();
    return true;
  }

  getByCategory(category: Post['category']): Post[] {
    return this.posts.filter(post => post.category === category);
  }

  getPublished(): Post[] {
    return this.posts.filter(post => post.status === 'published');
  }

  getByAuthor(authorId: string): Post[] {
    return this.posts.filter(post => post.authorId === authorId);
  }
}

// HSE repositories
export class HSEIncidentRepository {
  private incidents: HSEIncident[] = [];

  constructor() {
    this.incidents = getFromStorage<HSEIncident>('sogara_hse_incidents');
  }

  private save(): void {
    saveToStorage('sogara_hse_incidents', this.incidents);
  }

  async getAll(): Promise<HSEIncident[]> {
    return this.incidents.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  async getById(id: string): Promise<HSEIncident | undefined> {
    return this.incidents.find(incident => incident.id === id);
  }

  async create(incident: Omit<HSEIncident, 'id' | 'createdAt' | 'updatedAt'>): Promise<HSEIncident> {
    const newIncident: HSEIncident = {
      ...incident,
      id: generateId(),
      status: 'reported',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.incidents.push(newIncident);
    this.save();
    return newIncident;
  }

  async update(id: string, updates: Partial<HSEIncident>): Promise<HSEIncident | null> {
    const index = this.incidents.findIndex(incident => incident.id === id);
    if (index === -1) return null;

    this.incidents[index] = {
      ...this.incidents[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.save();
    return this.incidents[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.incidents.findIndex(incident => incident.id === id);
    if (index === -1) return false;

    this.incidents.splice(index, 1);
    this.save();
    return true;
  }

  async getByEmployee(employeeId: string): Promise<HSEIncident[]> {
    return this.incidents.filter(incident => incident.employeeId === employeeId);
  }

  async getByStatus(status: string): Promise<HSEIncident[]> {
    return this.incidents.filter(incident => incident.status === status);
  }

  async getByDateRange(start: Date, end: Date): Promise<HSEIncident[]> {
    return this.incidents.filter(incident => 
      incident.occurredAt >= start && incident.occurredAt <= end
    );
  }

  async updateStatus(id: string, status: string): Promise<HSEIncident | null> {
    return this.update(id, { status: status as any });
  }

  async addAttachment(id: string, file: string): Promise<HSEIncident | null> {
    const incident = await this.getById(id);
    if (!incident) return null;

    const attachments = incident.attachments || [];
    attachments.push(file);
    
    return this.update(id, { attachments });
  }

  getStats() {
    const openIncidents = this.incidents.filter(i => i.status !== 'resolved').length;
    const highSeverity = this.incidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length;
    const thisMonth = this.incidents.filter(i => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return i.occurredAt >= monthAgo;
    }).length;

    return { openIncidents, highSeverity, thisMonth };
  }
}

export class HSETrainingRepository {
  private trainings: HSETraining[] = [];

  constructor() {
    this.trainings = getFromStorage<HSETraining>('sogara_hse_trainings');
    if (this.trainings.length === 0) {
      this.seedData();
    }
  }

  private seedData(): void {
    const sampleTrainings: HSETraining[] = [
      {
        id: 'train1',
        title: 'Formation Sécurité Incendie',
        description: 'Formation obligatoire sur les procédures d\'évacuation et l\'utilisation des extincteurs',
        requiredForRoles: ['EMPLOYE', 'SUPERVISEUR', 'HSE'],
        duration: 120, // 2 heures
        validityMonths: 12,
        sessions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'train2',
        title: 'EPI et Équipements de Sécurité',
        description: 'Formation sur l\'utilisation correcte des équipements de protection individuelle',
        requiredForRoles: ['EMPLOYE', 'SUPERVISEUR'],
        duration: 90,
        validityMonths: 6,
        sessions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.trainings = sampleTrainings;
    this.save();
  }

  private save(): void {
    saveToStorage('sogara_hse_trainings', this.trainings);
  }

  async getAll(): Promise<HSETraining[]> {
    return this.trainings;
  }

  async getById(id: string): Promise<HSETraining | undefined> {
    return this.trainings.find(training => training.id === id);
  }

  async create(training: Omit<HSETraining, 'id' | 'createdAt' | 'updatedAt'>): Promise<HSETraining> {
    const newTraining: HSETraining = {
      ...training,
      id: generateId(),
      sessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.trainings.push(newTraining);
    this.save();
    return newTraining;
  }

  async update(id: string, updates: Partial<HSETraining>): Promise<HSETraining | null> {
    const index = this.trainings.findIndex(training => training.id === id);
    if (index === -1) return null;

    this.trainings[index] = {
      ...this.trainings[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.save();
    return this.trainings[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.trainings.findIndex(training => training.id === id);
    if (index === -1) return false;

    this.trainings.splice(index, 1);
    this.save();
    return true;
  }

  async getUpcoming(): Promise<HSETraining[]> {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return this.trainings.filter(training => 
      training.sessions.some(session => 
        session.date <= nextMonth && session.status === 'scheduled'
      )
    );
  }

  async createSession(trainingId: string, session: Omit<HSETrainingSession, 'id' | 'attendance'>): Promise<HSETrainingSession | null> {
    const training = await this.getById(trainingId);
    if (!training) return null;

    const newSession: HSETrainingSession = {
      ...session,
      id: generateId(),
      attendance: []
    };

    training.sessions.push(newSession);
    await this.update(trainingId, { sessions: training.sessions });
    
    return newSession;
  }

  async registerEmployee(sessionId: string, employeeId: string): Promise<void> {
    for (const training of this.trainings) {
      const session = training.sessions.find(s => s.id === sessionId);
      if (session) {
        const existingAttendance = session.attendance.find(a => a.employeeId === employeeId);
        
        if (!existingAttendance) {
          session.attendance.push({
            employeeId,
            status: 'registered'
          });
          await this.update(training.id, { sessions: training.sessions });
        }
        return;
      }
    }
  }

  async markAttendance(sessionId: string, employeeId: string, status: string): Promise<void> {
    for (const training of this.trainings) {
      const session = training.sessions.find(s => s.id === sessionId);
      if (session) {
        const attendance = session.attendance.find(a => a.employeeId === employeeId);
        if (attendance) {
          attendance.status = status as any;
          await this.update(training.id, { sessions: training.sessions });
        }
        return;
      }
    }
  }

  async getEmployeeTrainings(employeeId: string): Promise<HSETraining[]> {
    return this.trainings.filter(training => 
      training.sessions.some(session =>
        session.attendance.some(att => att.employeeId === employeeId)
      )
    );
  }

  async getCertificationsExpiring(days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    // Simuler les certifications qui expirent
    return [];
  }

  getStats() {
    const upcomingTrainings = this.trainings.filter(t => 
      t.sessions.some(s => s.date > new Date() && s.status === 'scheduled')
    ).length;
    
    const totalSessions = this.trainings.reduce((sum, t) => sum + t.sessions.length, 0);
    const completedSessions = this.trainings.reduce((sum, t) => 
      sum + t.sessions.filter(s => s.status === 'completed').length, 0
    );

    return {
      upcomingTrainings,
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
    };
  }
}

export const repositories = {
  employees: new EmployeeRepository(),
  visitors: new VisitorRepository(),
  visits: new VisitRepository(),
  packages: new PackageRepository(),
  equipment: new EquipmentRepository(),
  notifications: new NotificationRepository(),
  posts: new PostRepository(),
  hseIncidents: new HSEIncidentRepository(),
  hseTrainings: new HSETrainingRepository(),
  documents: new DocumentRepository(),
};