import { HSETrainingModule, HSETrainingProgress, HSEAssessmentResult } from '@/types';
import { generateId } from '@/utils/id';

class HSETrainingService {
  private readonly STORAGE_KEY = 'hse_training_progress';
  private progressCache: Map<string, HSETrainingProgress> = new Map();

  // Charger les données de progression depuis le localStorage
  private loadProgress(): HSETrainingProgress[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return data.map((item: any) => ({
          ...item,
          startedAt: item.startedAt ? new Date(item.startedAt) : undefined,
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
          certificateIssuedAt: item.certificateIssuedAt ? new Date(item.certificateIssuedAt) : undefined,
          expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Erreur lors du chargement des progressions:', error);
      return [];
    }
  }

  // Sauvegarder les données de progression
  private saveProgress(progress: HSETrainingProgress[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
      // Mettre à jour le cache
      this.progressCache.clear();
      progress.forEach(p => this.progressCache.set(`${p.employeeId}-${p.trainingModuleId}`, p));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des progressions:', error);
    }
  }

  // Obtenir ou créer une progression pour un employé
  getOrCreateProgress(employeeId: string, trainingModuleId: string): HSETrainingProgress {
    const key = `${employeeId}-${trainingModuleId}`;
    
    if (this.progressCache.has(key)) {
      return this.progressCache.get(key)!;
    }

    const allProgress = this.loadProgress();
    let progress = allProgress.find(p => p.employeeId === employeeId && p.trainingModuleId === trainingModuleId);

    if (!progress) {
      progress = {
        id: generateId(),
        employeeId,
        trainingModuleId,
        status: 'not_started',
        completedModules: [],
        assessmentResults: [],
      };
      allProgress.push(progress);
      this.saveProgress(allProgress);
    }

    this.progressCache.set(key, progress);
    return progress;
  }

  // Démarrer une formation
  startTraining(employeeId: string, trainingModuleId: string): HSETrainingProgress {
    const progress = this.getOrCreateProgress(employeeId, trainingModuleId);
    
    if (progress.status === 'not_started') {
      progress.status = 'in_progress';
      progress.startedAt = new Date();
      this.updateProgress(progress);
    }

    return progress;
  }

  // Marquer un module comme terminé
  completeModule(employeeId: string, trainingModuleId: string, moduleId: string): HSETrainingProgress {
    const progress = this.getOrCreateProgress(employeeId, trainingModuleId);
    
    if (!progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
      this.updateProgress(progress);
    }

    return progress;
  }

  // Enregistrer un résultat d'évaluation
  recordAssessmentResult(
    employeeId: string, 
    trainingModuleId: string, 
    assessmentResult: Omit<HSEAssessmentResult, 'completedAt'>
  ): HSETrainingProgress {
    const progress = this.getOrCreateProgress(employeeId, trainingModuleId);
    
    const result: HSEAssessmentResult = {
      ...assessmentResult,
      completedAt: new Date(),
    };

    // Remplacer résultat existant ou ajouter nouveau
    const existingIndex = progress.assessmentResults.findIndex(
      r => r.assessmentId === result.assessmentId
    );

    if (existingIndex >= 0) {
      progress.assessmentResults[existingIndex] = result;
    } else {
      progress.assessmentResults.push(result);
    }

    this.updateProgress(progress);
    return progress;
  }

  // Finaliser une formation
  completeTraining(
    employeeId: string, 
    trainingModuleId: string, 
    validityMonths: number
  ): HSETrainingProgress {
    const progress = this.getOrCreateProgress(employeeId, trainingModuleId);
    
    progress.status = 'completed';
    progress.completedAt = new Date();
    progress.certificateIssuedAt = new Date();
    
    // Calculer la date d'expiration
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + validityMonths);
    progress.expiresAt = expirationDate;

    this.updateProgress(progress);
    return progress;
  }

  // Mettre à jour une progression
  private updateProgress(progress: HSETrainingProgress): void {
    const allProgress = this.loadProgress();
    const index = allProgress.findIndex(p => p.id === progress.id);
    
    if (index >= 0) {
      allProgress[index] = progress;
    } else {
      allProgress.push(progress);
    }

    this.saveProgress(allProgress);
  }

  // Obtenir toutes les progressions d'un employé
  getEmployeeProgress(employeeId: string): HSETrainingProgress[] {
    return this.loadProgress().filter(p => p.employeeId === employeeId);
  }

  // Obtenir les progressions pour une formation
  getTrainingProgress(trainingModuleId: string): HSETrainingProgress[] {
    return this.loadProgress().filter(p => p.trainingModuleId === trainingModuleId);
  }

  // Vérifier si formation expirant bientôt
  getExpiringTrainings(employeeId: string, withinDays: number = 30): HSETrainingProgress[] {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + withinDays);

    return this.getEmployeeProgress(employeeId).filter(p => 
      p.status === 'completed' && 
      p.expiresAt && 
      p.expiresAt <= threshold && 
      p.expiresAt > now
    );
  }

  // Obtenir formations expirées
  getExpiredTrainings(employeeId: string): HSETrainingProgress[] {
    const now = new Date();
    
    return this.getEmployeeProgress(employeeId).filter(p => 
      p.status === 'completed' && 
      p.expiresAt && 
      p.expiresAt <= now
    );
  }

  // Calculer le taux de complétion d'une formation
  getCompletionRate(employeeId: string, trainingModuleId: string, totalModules: number): number {
    const progress = this.getOrCreateProgress(employeeId, trainingModuleId);
    return Math.round((progress.completedModules.length / totalModules) * 100);
  }

  // Vérifier si toutes les évaluations sont passées
  hasPassedAllAssessments(progress: HSETrainingProgress, requiredAssessments: string[]): boolean {
    return requiredAssessments.every(assessmentId => {
      const result = progress.assessmentResults.find(r => r.assessmentId === assessmentId);
      return result && result.passed;
    });
  }

  // Réinitialiser une formation (pour recyclage)
  resetTraining(employeeId: string, trainingModuleId: string): HSETrainingProgress {
    const progress = this.getOrCreateProgress(employeeId, trainingModuleId);
    
    progress.status = 'not_started';
    progress.currentModule = undefined;
    progress.completedModules = [];
    progress.assessmentResults = [];
    progress.startedAt = undefined;
    progress.completedAt = undefined;
    progress.certificateIssuedAt = undefined;
    progress.expiresAt = undefined;

    this.updateProgress(progress);
    return progress;
  }

  // Générer un rapport de progression
  generateProgressReport(employeeId: string): {
    totalTrainings: number;
    completed: number;
    inProgress: number;
    expired: number;
    expiringSoon: number;
    complianceRate: number;
  } {
    const progress = this.getEmployeeProgress(employeeId);
    const expiring = this.getExpiringTrainings(employeeId);
    const expired = this.getExpiredTrainings(employeeId);

    const completed = progress.filter(p => p.status === 'completed' && !expired.some(e => e.id === p.id)).length;
    const inProgress = progress.filter(p => p.status === 'in_progress').length;

    return {
      totalTrainings: progress.length,
      completed,
      inProgress,
      expired: expired.length,
      expiringSoon: expiring.length,
      complianceRate: progress.length > 0 ? Math.round((completed / progress.length) * 100) : 0,
    };
  }
}

export const hseTrainingService = new HSETrainingService();
