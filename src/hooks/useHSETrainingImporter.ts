import { useState, useCallback } from 'react';
import { HSETraining, HSETrainingSession, Employee } from '@/types';
import { hseTrainingImporter } from '@/services/hse-training-importer.service';
import { useHSETrainings } from './useHSETrainings';
import { useApp } from '@/contexts/AppContext';

interface TrainingNeed {
  employeeId: string;
  employee: Employee;
  requiredTrainings: HSETraining[];
  missingTrainings: HSETraining[];
  expiredTrainings: Array<{training: HSETraining; expirationDate: Date}>;
  complianceRate: number;
}

interface ComplianceReport {
  summary: {
    totalEmployees: number;
    overallCompliance: number;
    criticalTrainings: number;
    upcomingSessions: number;
  };
  byCategory: Array<{
    category: string;
    trainingsCount: number;
    averageCompliance: number;
  }>;
  byRole: Array<{
    role: string;
    employeesCount: number;
    averageCompliance: number;
    criticalIssues: number;
  }>;
  urgentActions: Array<{
    type: 'missing' | 'expired';
    employeeId: string;
    employeeName: string;
    trainingTitle: string;
    daysOverdue?: number;
  }>;
}

export function useHSETrainingImporter() {
  const { state, dispatch } = useApp();
  const { initializeTrainings } = useHSETrainings();
  
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    step: string;
    progress: number;
    message: string;
  }>({
    step: '',
    progress: 0,
    message: ''
  });
  const [lastImportResult, setLastImportResult] = useState<{
    importedCount: number;
    plannedSessions: number;
    complianceReport: ComplianceReport | null;
    importedAt: Date;
  } | null>(null);

  // Importer les modules de formation
  const importTrainingModules = useCallback(async () => {
    if (isImporting) return;
    
    setIsImporting(true);
    setImportProgress({ step: 'importing', progress: 10, message: 'Importation des modules de formation...' });

    try {
      const importedTrainings = await hseTrainingImporter.importTrainingModules();
      
      // Recharger les formations dans le contexte
      await initializeTrainings();
      
      setImportProgress({ step: 'imported', progress: 100, message: `${importedTrainings.length} modules importés avec succès` });
      
      return importedTrainings;
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      setImportProgress({ step: 'error', progress: 0, message: 'Erreur lors de l\'importation' });
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, [isImporting, initializeTrainings]);

  // Analyser les besoins de formation
  const analyzeTrainingNeeds = useCallback(async (): Promise<TrainingNeed[]> => {
    setImportProgress({ step: 'analyzing', progress: 30, message: 'Analyse des besoins de formation...' });
    
    try {
      const needs = await hseTrainingImporter.analyzeTrainingNeeds();
      setImportProgress({ step: 'analyzed', progress: 60, message: `Analyse terminée pour ${needs.length} employés` });
      
      return needs;
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setImportProgress({ step: 'error', progress: 0, message: 'Erreur lors de l\'analyse' });
      throw error;
    }
  }, []);

  // Planifier les sessions de formation
  const planTrainingSessions = useCallback(async (weeksAhead: number = 12): Promise<HSETrainingSession[]> => {
    setImportProgress({ step: 'planning', progress: 70, message: 'Planification des sessions de formation...' });
    
    try {
      const sessions = await hseTrainingImporter.planTrainingSessions(weeksAhead);
      
      // Recharger les formations pour inclure les nouvelles sessions
      await initializeTrainings();
      
      setImportProgress({ step: 'planned', progress: 90, message: `${sessions.length} sessions planifiées` });
      
      return sessions;
    } catch (error) {
      console.error('Erreur lors de la planification:', error);
      setImportProgress({ step: 'error', progress: 0, message: 'Erreur lors de la planification' });
      throw error;
    }
  }, [initializeTrainings]);

  // Générer le rapport de conformité
  const generateComplianceReport = useCallback(async (): Promise<ComplianceReport> => {
    setImportProgress({ step: 'reporting', progress: 80, message: 'Génération du rapport de conformité...' });
    
    try {
      const report = await hseTrainingImporter.generateComplianceReport();
      setImportProgress({ step: 'completed', progress: 100, message: `Rapport généré - Conformité: ${report.summary.overallCompliance}%` });
      
      return report;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      setImportProgress({ step: 'error', progress: 0, message: 'Erreur lors de la génération du rapport' });
      throw error;
    }
  }, []);

  // Simuler des complétions de formation (pour la démo)
  const simulateTrainingCompletions = useCallback(async () => {
    setImportProgress({ step: 'simulating', progress: 50, message: 'Simulation des certifications...' });
    
    try {
      await hseTrainingImporter.simulateTrainingCompletions();
      
      // Recharger les formations
      await initializeTrainings();
      
      setImportProgress({ step: 'simulated', progress: 80, message: 'Certifications simulées avec succès' });
    } catch (error) {
      console.error('Erreur lors de la simulation:', error);
      setImportProgress({ step: 'error', progress: 0, message: 'Erreur lors de la simulation' });
      throw error;
    }
  }, [initializeTrainings]);

  // Initialiser complètement le système HSE
  const initializeCompleteHSESystem = useCallback(async () => {
    if (isImporting) return;
    
    setIsImporting(true);
    let importedCount = 0;
    let plannedSessions = 0;
    let complianceReport: ComplianceReport | null = null;

    try {
      // 1. Importer les modules
      setImportProgress({ step: 'importing', progress: 10, message: 'Importation des modules de formation...' });
      const importedTrainings = await hseTrainingImporter.importTrainingModules();
      importedCount = importedTrainings.length;
      
      // 2. Recharger les formations
      await initializeTrainings();
      
      // 3. Analyser les besoins
      setImportProgress({ step: 'analyzing', progress: 30, message: 'Analyse des besoins de formation...' });
      const needs = await hseTrainingImporter.analyzeTrainingNeeds();
      
      // 4. Planifier les sessions
      setImportProgress({ step: 'planning', progress: 50, message: 'Planification des sessions...' });
      const sessions = await hseTrainingImporter.planTrainingSessions(16); // 4 mois
      plannedSessions = sessions.length;
      
      // 5. Simuler quelques complétions
      setImportProgress({ step: 'simulating', progress: 70, message: 'Simulation des certifications...' });
      await hseTrainingImporter.simulateTrainingCompletions();
      
      // 6. Générer le rapport
      setImportProgress({ step: 'reporting', progress: 90, message: 'Génération du rapport...' });
      complianceReport = await hseTrainingImporter.generateComplianceReport();
      
      // 7. Recharger les données finales
      await initializeTrainings();
      
      // Sauvegarder le résultat
      const result = {
        importedCount,
        plannedSessions,
        complianceReport,
        importedAt: new Date()
      };
      setLastImportResult(result);
      
      setImportProgress({ 
        step: 'completed', 
        progress: 100, 
        message: `✅ Système initialisé: ${importedCount} modules, ${plannedSessions} sessions, ${complianceReport.summary.overallCompliance}% conformité` 
      });

      // Créer une notification de succès
      const notification = {
        id: Date.now().toString(),
        type: 'success' as const,
        title: 'Système HSE initialisé',
        message: `${importedCount} formations importées, ${plannedSessions} sessions planifiées`,
        timestamp: new Date(),
        read: false,
        metadata: {
          importedCount,
          plannedSessions,
          complianceRate: complianceReport.summary.overallCompliance
        }
      };
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      
      return result;
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation complète:', error);
      setImportProgress({ step: 'error', progress: 0, message: `Erreur: ${error}` });
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, [isImporting, initializeTrainings, dispatch]);

  // Obtenir les statistiques d'importation
  const getImportStats = useCallback(() => {
    if (!lastImportResult) return null;
    
    return {
      lastImport: lastImportResult.importedAt,
      modulesImported: lastImportResult.importedCount,
      sessionsPlanned: lastImportResult.plannedSessions,
      overallCompliance: lastImportResult.complianceReport?.summary.overallCompliance || 0,
      urgentActions: lastImportResult.complianceReport?.urgentActions.length || 0,
      hasRecentImport: (new Date().getTime() - lastImportResult.importedAt.getTime()) < (24 * 60 * 60 * 1000) // Moins de 24h
    };
  }, [lastImportResult]);

  // Vérifier si une importation est nécessaire
  const needsImport = useCallback(() => {
    const stats = getImportStats();
    return !stats || !stats.hasRecentImport || stats.modulesImported === 0;
  }, [getImportStats]);

  // Réinitialiser le progress
  const resetProgress = useCallback(() => {
    setImportProgress({
      step: '',
      progress: 0,
      message: ''
    });
  }, []);

  return {
    // States
    isImporting,
    importProgress,
    lastImportResult,
    
    // Actions
    importTrainingModules,
    analyzeTrainingNeeds,
    planTrainingSessions,
    generateComplianceReport,
    simulateTrainingCompletions,
    initializeCompleteHSESystem,
    
    // Utils
    getImportStats,
    needsImport,
    resetProgress,
  };
}
