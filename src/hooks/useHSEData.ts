import { useEffect } from 'react';
import { HSEIncident, HSETraining, HSETrainingSession, HSEAttendance } from '@/types';
import { repositories } from '@/services/repositories';
import { useHSEIncidents } from './useHSEIncidents';
import { useHSETrainings } from './useHSETrainings';
import { useHSETrainingImporter } from './useHSETrainingImporter';

/**
 * Hook pour initialiser le système HSE complet avec les modules de formation réels
 * Utilise le système d'importation intelligent pour créer un environnement complet
 */
export function useHSEData() {
  const { addIncident } = useHSEIncidents();
  const { needsImport, initializeCompleteHSESystem, getImportStats } = useHSETrainingImporter();

  const createSampleIncidents = async () => {
    const existingIncidents = await repositories.hseIncidents.getAll();
    if (existingIncidents.length > 0) return; // Déjà des données

    const sampleIncidents: Omit<HSEIncident, 'id' | 'createdAt' | 'updatedAt' | 'status'>[] = [
      {
        employeeId: '1',
        type: 'EPI manquant ou défaillant',
        severity: 'medium',
        description: 'Casque de sécurité endommagé lors de la maintenance. Remplacé immédiatement.',
        location: 'Zone production',
        occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reportedBy: 'Christian ELLA',
        investigatedBy: 'Marie LAKIBI',
        correctiveActions: 'Casque remplacé, vérification de tous les EPI de l\'équipe effectuée.'
      },
      {
        employeeId: '5',
        type: 'Quasi-accident',
        severity: 'low',
        description: 'Glissade évitée de justesse à cause d\'une flaque d\'eau dans le couloir.',
        location: 'Bureau administratif',
        occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reportedBy: 'Christian ELLA',
      },
      {
        employeeId: '2',
        type: 'Incident environnemental',
        severity: 'high',
        description: 'Petite fuite d\'huile détectée près de l\'entrée principal. Intervention immédiate des équipes.',
        location: 'Entrée site',
        occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        reportedBy: 'Sylvie KOUMBA',
        investigatedBy: 'Marie LAKIBI',
      }
    ];

    for (const incident of sampleIncidents) {
      await addIncident(incident);
    }
  };

  const initializeIntelligentTrainingSystem = async () => {
    // Vérifier si le système de formation a besoin d'être initialisé
    if (needsImport()) {
      console.log('🚀 Initialisation automatique du système de formation HSE...');
      try {
        await initializeCompleteHSESystem();
        console.log('✅ Système de formation HSE initialisé avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du système de formation:', error);
      }
    } else {
      const stats = getImportStats();
      console.log(`ℹ️ Système de formation déjà initialisé (${stats?.modulesImported} modules, ${stats?.sessionsPlanned} sessions)`);
    }
  };

  const initializeHSEData = async () => {
    try {
      // 1. Créer quelques incidents de démonstration
      await createSampleIncidents();
      
      // 2. Initialiser le système de formation intelligent
      await initializeIntelligentTrainingSystem();
      
      console.log('✅ Données HSE complètes initialisées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données HSE:', error);
    }
  };

  // Exposer les fonctions pour utilisation externe (pas d'auto-initialisation ici)
  return {
    initializeHSEData,
    initializeIntelligentTrainingSystem,
    createSampleIncidents,
  };
}
