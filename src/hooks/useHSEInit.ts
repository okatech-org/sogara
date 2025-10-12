import { useEffect, useState } from 'react';
import { repositories } from '@/services/repositories';
import { useApp } from '@/contexts/AppContext';
import { HSEIncident } from '@/types';

/**
 * Hook simple pour initialiser les données HSE de base
 * Remplace useHSEData pour éviter les conflits
 */
export function useHSEInit() {
  const { dispatch } = useApp();
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeBasicHSEData = async () => {
    if (isInitialized) return;

    try {
      // 1. Charger les incidents existants
      const existingIncidents = await repositories.hseIncidents.getAll();
      dispatch({ type: 'SET_HSE_INCIDENTS', payload: existingIncidents });

      // 2. Charger les formations existantes  
      const existingTrainings = await repositories.hseTrainings.getAll();
      dispatch({ type: 'SET_HSE_TRAININGS', payload: existingTrainings });

      // 3. Créer quelques incidents de démo si aucun n'existe
      if (existingIncidents.length === 0) {
        const sampleIncidents: Omit<HSEIncident, 'id' | 'createdAt' | 'updatedAt'>[] = [
          {
            employeeId: '1',
            type: 'EPI manquant ou défaillant',
            severity: 'medium',
            description: 'Casque de sécurité endommagé lors de la maintenance. Remplacé immédiatement.',
            location: 'Zone production',
            occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status: 'resolved',
            reportedBy: 'Pierre BEKALE',
            investigatedBy: 'Marie-Claire NZIEGE',
            correctiveActions: 'Casque remplacé, vérification de tous les EPI de l\'équipe effectuée.'
          },
          {
            employeeId: '5',
            type: 'Quasi-accident',
            severity: 'low',
            description: 'Glissade évitée de justesse à cause d\'une flaque d\'eau dans le couloir.',
            location: 'Bureau administratif',
            occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: 'investigating',
            reportedBy: 'Pierre BEKALE',
            investigatedBy: 'Marie-Claire NZIEGE'
          },
          {
            employeeId: '2',
            type: 'Incident environnemental',
            severity: 'high',
            description: 'Petite fuite d\'huile détectée près de l\'entrée principal. Intervention immédiate des équipes.',
            location: 'Entrée site',
            occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'reported',
            reportedBy: 'Sylvie KOUMBA',
          }
        ];

        for (const incidentData of sampleIncidents) {
          const newIncident = await repositories.hseIncidents.create(incidentData);
          dispatch({ type: 'ADD_HSE_INCIDENT', payload: newIncident });
        }
        
        console.log(`✅ ${sampleIncidents.length} incidents de démo créés`);
      }

      // 4. Charger les notifications
      const notifications = repositories.notifications.getAll();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });

      setIsInitialized(true);
      console.log('✅ Données HSE de base initialisées');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation HSE:', error);
    }
  };

  useEffect(() => {
    initializeBasicHSEData();
  }, []);

  return {
    isInitialized,
    initializeBasicHSEData,
  };
}
