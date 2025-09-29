import { useCallback, useEffect, useState } from 'react';
import { HSEIncident, HSENotification } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { toast } from '@/hooks/use-toast';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useHSEIncidents() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialiser les incidents depuis le storage au premier chargement
  const initializeIncidents = useCallback(async () => {
    if (initialized || loading) return;
    
    try {
      setLoading(true);
      setError(null);
      const incidents = await repositories.hseIncidents.getAll();
      dispatch({ type: 'SET_HSE_INCIDENTS', payload: incidents });
      setInitialized(true);
      console.log(`📋 ${incidents.length} incidents HSE chargés`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des incidents';
      setError(errorMessage);
      console.error('❌ Erreur chargement incidents HSE:', err);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les incidents HSE",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch, initialized, loading]);

  // Auto-initialiser au premier rendu
  useEffect(() => {
    initializeIncidents();
  }, [initializeIncidents]);

  const addIncident = useCallback(async (incident: Omit<HSEIncident, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newIncident = await repositories.hseIncidents.create({
        ...incident,
        status: 'reported',
      });

      dispatch({ type: 'ADD_HSE_INCIDENT', payload: newIncident });
      
      // Créer notification si sévérité élevée
      if (newIncident.severity === 'high') {
        const notification: HSENotification = {
          id: generateId(),
          type: 'hse_incident_high',
          title: 'Incident de sévérité élevée',
          message: `${newIncident.type} - ${newIncident.location}`,
          timestamp: new Date(),
          read: false,
          metadata: { incidentId: newIncident.id }
        };
        
        repositories.notifications.create(notification);
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      }
      
      toast({
        title: "Incident déclaré",
        description: `L'incident "${newIncident.type}" a été enregistré avec succès`,
        variant: "default",
      });
      
      return newIncident;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'incident';
      setError(errorMessage);
      console.error('❌ Erreur création incident:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'incident",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateIncident = useCallback(async (id: string, updates: Partial<HSEIncident>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedIncident = await repositories.hseIncidents.update(id, updates);
      if (updatedIncident) {
        dispatch({ type: 'UPDATE_HSE_INCIDENT', payload: updatedIncident });
        
        toast({
          title: "Incident mis à jour",
          description: "Les modifications ont été enregistrées",
          variant: "default",
        });
      }
      return updatedIncident;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('❌ Erreur mise à jour incident:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'incident",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteIncident = useCallback(async (id: string) => {
    const success = await repositories.hseIncidents.delete(id);
    if (success) {
      dispatch({ type: 'DELETE_HSE_INCIDENT', payload: id });
    }
    return success;
  }, [dispatch]);

  const assignInvestigator = useCallback(async (incidentId: string, investigatorId: string) => {
    return updateIncident(incidentId, { 
      investigatedBy: investigatorId,
      status: 'investigating'
    });
  }, [updateIncident]);

  const resolveIncident = useCallback(async (incidentId: string, correctiveActions: string) => {
    return updateIncident(incidentId, {
      status: 'resolved',
      correctiveActions,
    });
  }, [updateIncident]);

  const addAttachment = useCallback(async (incidentId: string, attachment: string) => {
    return repositories.hseIncidents.addAttachment(incidentId, attachment);
  }, []);

  // Filtres et requêtes
  const getIncidentsByStatus = useCallback((status: HSEIncident['status']) => {
    return state.hseIncidents.filter(i => i.status === status);
  }, [state.hseIncidents]);

  const getIncidentsBySeverity = useCallback((severity: HSEIncident['severity']) => {
    return state.hseIncidents.filter(i => i.severity === severity);
  }, [state.hseIncidents]);

  const getIncidentsByEmployee = useCallback((employeeId: string) => {
    return state.hseIncidents.filter(i => i.employeeId === employeeId);
  }, [state.hseIncidents]);

  const getIncidentsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return state.hseIncidents.filter(i => 
      i.occurredAt >= startDate && i.occurredAt <= endDate
    );
  }, [state.hseIncidents]);

  const getRecentIncidents = useCallback((days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return state.hseIncidents
      .filter(i => i.occurredAt >= cutoffDate)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }, [state.hseIncidents]);

  // Statistiques
  const getStats = useCallback(() => {
    const open = getIncidentsByStatus('reported').length + getIncidentsByStatus('investigating').length;
    const resolved = getIncidentsByStatus('resolved').length;
    const highSeverity = getIncidentsBySeverity('high').filter(i => i.status !== 'resolved').length;
    
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    const monthlyIncidents = state.hseIncidents.filter(i => i.occurredAt >= thisMonth).length;

    return {
      open,
      resolved,
      thisMonth: monthlyIncidents,
      highSeverity,
      total: state.hseIncidents.length,
    };
  }, [state.hseIncidents, getIncidentsByStatus, getIncidentsBySeverity]);

  return {
    // État
    incidents: state.hseIncidents,
    loading,
    error,
    initialized,
    
    // Actions
    initializeIncidents,
    addIncident,
    updateIncident,
    deleteIncident,
    assignInvestigator,
    resolveIncident,
    addAttachment,
    
    // Queries
    getIncidentsByStatus,
    getIncidentsBySeverity,
    getIncidentsByEmployee,
    getIncidentsByDateRange,
    getRecentIncidents,
    getStats,
  };
}
