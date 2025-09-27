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
  UserRole 
} from '@/types';

const STORAGE_KEYS = {
  EMPLOYEES: 'sogara_employees',
  VISITORS: 'sogara_visitors',
  VISITS: 'sogara_visits',
  PACKAGES: 'sogara_packages',
  EQUIPMENT: 'sogara_equipment',
  HSE_INCIDENTS: 'sogara_hse_incidents',
  HSE_TRAININGS: 'sogara_hse_trainings',
  NOTIFICATIONS: 'sogara_notifications',
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
      // If storage was partially seeded in previous versions, ensure all demo accounts exist
      this.ensureDemoEmployees();
    }
  }

  private seedData(): void {
    const sampleEmployees: Employee[] = [
      {
        id: '1',
        firstName: 'Pierre',
        lastName: 'ANTCHOUET',
        matricule: 'EMP001',
        service: 'Production',
        roles: ['EMPLOYE'],
        competences: ['Opérateur', 'Sécurité niveau 1'],
        habilitations: ['Conduite', 'EPI obligatoire'],
        email: 'pierre.antchouet@sogara.com',
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
        service: 'Accueil',
        roles: ['RECEP'],
        competences: ['Accueil visiteurs', 'Gestion colis'],
        habilitations: ['Badge visiteurs', 'Système accès'],
        email: 'sylvie.koumba@sogara.com',
        status: 'active',
        stats: { visitsReceived: 15, packagesReceived: 8, hseTrainingsCompleted: 4 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        firstName: 'Alain',
        lastName: 'OBAME',
        matricule: 'ADM001',
        service: 'Direction',
        roles: ['ADMIN'],
        competences: ['Gestion système', 'Administration', 'Supervision'],
        habilitations: ['Accès total', 'Configuration système'],
        email: 'alain.obame@sogara.com',
        status: 'active',
        stats: { visitsReceived: 3, packagesReceived: 1, hseTrainingsCompleted: 8 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        firstName: 'Marie',
        lastName: 'LAKIBI',
        matricule: 'HSE001',
        service: 'HSE',
        roles: ['HSE'],
        competences: ['Sécurité industrielle', 'Formation HSE', 'Audit conformité'],
        habilitations: ['Inspection sécurité', 'Formation obligatoire', 'Incident management'],
        email: 'marie.lakibi@sogara.com',
        status: 'active',
        stats: { visitsReceived: 8, packagesReceived: 3, hseTrainingsCompleted: 12 },
        equipmentIds: ['eq3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        firstName: 'Christian',
        lastName: 'ELLA',
        matricule: 'SUP001',
        service: 'Production',
        roles: ['SUPERVISEUR'],
        competences: ['Management équipes', 'Planification', 'Contrôle qualité'],
        habilitations: ['Supervision opérations', 'Validation processus'],
        email: 'christian.ella@sogara.com',
        status: 'active',
        stats: { visitsReceived: 12, packagesReceived: 6, hseTrainingsCompleted: 7 },
        equipmentIds: ['eq4'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    this.employees = sampleEmployees;
    this.save();
  }

  // Ensure demo employees exist even if storage was partially seeded
  private ensureDemoEmployees(): void {
    const sampleEmployees: Employee[] = [
      {
        id: '1',
        firstName: 'Pierre',
        lastName: 'ANTCHOUET',
        matricule: 'EMP001',
        service: 'Production',
        roles: ['EMPLOYE'],
        competences: ['Opérateur', 'Sécurité niveau 1'],
        habilitations: ['Conduite', 'EPI obligatoire'],
        email: 'pierre.antchouet@sogara.com',
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
        service: 'Accueil',
        roles: ['RECEP'],
        competences: ['Accueil visiteurs', 'Gestion colis'],
        habilitations: ['Badge visiteurs', 'Système accès'],
        email: 'sylvie.koumba@sogara.com',
        status: 'active',
        stats: { visitsReceived: 15, packagesReceived: 8, hseTrainingsCompleted: 4 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        firstName: 'Alain',
        lastName: 'OBAME',
        matricule: 'ADM001',
        service: 'Direction',
        roles: ['ADMIN'],
        competences: ['Gestion système', 'Administration', 'Supervision'],
        habilitations: ['Accès total', 'Configuration système'],
        email: 'alain.obame@sogara.com',
        status: 'active',
        stats: { visitsReceived: 3, packagesReceived: 1, hseTrainingsCompleted: 8 },
        equipmentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        firstName: 'Marie',
        lastName: 'LAKIBI',
        matricule: 'HSE001',
        service: 'HSE',
        roles: ['HSE'],
        competences: ['Sécurité industrielle', 'Formation HSE', 'Audit conformité'],
        habilitations: ['Inspection sécurité', 'Formation obligatoire', 'Incident management'],
        email: 'marie.lakibi@sogara.com',
        status: 'active',
        stats: { visitsReceived: 8, packagesReceived: 3, hseTrainingsCompleted: 12 },
        equipmentIds: ['eq3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        firstName: 'Christian',
        lastName: 'ELLA',
        matricule: 'SUP001',
        service: 'Production',
        roles: ['SUPERVISEUR'],
        competences: ['Management équipes', 'Planification', 'Contrôle qualité'],
        habilitations: ['Supervision opérations', 'Validation processus'],
        email: 'christian.ella@sogara.com',
        status: 'active',
        stats: { visitsReceived: 12, packagesReceived: 6, hseTrainingsCompleted: 7 },
        equipmentIds: ['eq4'],
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
    this.notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  }

  private save(): void {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  getAll(): Notification[] {
    return this.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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

export const repositories = {
  employees: new EmployeeRepository(),
  visitors: new VisitorRepository(),
  visits: new VisitRepository(),
  packages: new PackageRepository(),
  equipment: new EquipmentRepository(),
  notifications: new NotificationRepository(),
};