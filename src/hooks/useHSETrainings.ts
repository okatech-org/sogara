import { useCallback, useEffect, useState } from 'react';
import { HSETraining, HSETrainingSession, HSEAttendance, HSENotification, UserRole } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { toast } from '@/hooks/use-toast';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useHSETrainings() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialiser les formations depuis le storage
  const initializeTrainings = useCallback(async () => {
    if (initialized || loading) return;
    
    try {
      setLoading(true);
      setError(null);
      const trainings = await repositories.hseTrainings.getAll();
      dispatch({ type: 'SET_HSE_TRAININGS', payload: trainings });
      setInitialized(true);
      console.log(`🎓 ${trainings.length} formations HSE chargées`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des formations';
      setError(errorMessage);
      console.error('❌ Erreur chargement formations HSE:', err);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les formations HSE",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch, initialized, loading]);

  // Auto-initialiser au premier rendu
  useEffect(() => {
    initializeTrainings();
  }, [initializeTrainings]);

  const addTraining = useCallback(async (training: Omit<HSETraining, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newTraining = await repositories.hseTrainings.create(training);
      dispatch({ type: 'ADD_HSE_TRAINING', payload: newTraining });
      
      toast({
        title: "Formation créée",
        description: `La formation "${newTraining.title}" a été ajoutée`,
        variant: "default",
      });
      
      return newTraining;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la formation';
      setError(errorMessage);
      console.error('❌ Erreur création formation:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer la formation",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateTraining = useCallback(async (id: string, updates: Partial<HSETraining>) => {
    const updatedTraining = await repositories.hseTrainings.update(id, updates);
    if (updatedTraining) {
      dispatch({ type: 'UPDATE_HSE_TRAINING', payload: updatedTraining });
    }
    return updatedTraining;
  }, [dispatch]);

  const deleteTraining = useCallback(async (id: string) => {
    const success = await repositories.hseTrainings.delete(id);
    if (success) {
      dispatch({ type: 'DELETE_HSE_TRAINING', payload: id });
    }
    return success;
  }, [dispatch]);

  const addSession = useCallback(async (trainingId: string, session: Omit<HSETrainingSession, 'id' | 'attendance'>) => {
    const newSession = await repositories.hseTrainings.createSession(trainingId, session);
    if (newSession) {
      const training = state.hseTrainings.find(t => t.id === trainingId);
      if (training) {
        const updatedTraining = {
          ...training,
          sessions: [...training.sessions, newSession]
        };
        dispatch({ type: 'UPDATE_HSE_TRAINING', payload: updatedTraining });
      }
    }
    return newSession;
  }, [dispatch, state.hseTrainings]);

  const registerEmployee = useCallback(async (sessionId: string, employeeId: string) => {
    await repositories.hseTrainings.registerEmployee(sessionId, employeeId);
    
    // Recharger les formations pour avoir les données à jour
    const trainings = await repositories.hseTrainings.getAll();
    dispatch({ type: 'SET_HSE_TRAININGS', payload: trainings });
  }, [dispatch]);

  const markAttendance = useCallback(async (
    sessionId: string, 
    employeeId: string, 
    status: HSEAttendance['status'],
    score?: number,
    notes?: string
  ) => {
    await repositories.hseTrainings.markAttendance(sessionId, employeeId, status);
    
    // Si la formation est complétée, calculer les dates de certification
    if (status === 'completed') {
      const training = getTrainingBySessionId(sessionId);
      if (training) {
        const certificationDate = new Date();
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + training.validityMonths);
        
        // Mise à jour avec les dates de certification
        for (const t of state.hseTrainings) {
          const session = t.sessions.find(s => s.id === sessionId);
          if (session) {
            const attendance = session.attendance.find(a => a.employeeId === employeeId);
            if (attendance) {
              attendance.certificationDate = certificationDate;
              attendance.expirationDate = expirationDate;
              attendance.score = score;
              attendance.notes = notes;
            }
          }
        }
      }
    }
    
    // Recharger les formations
    const trainings = await repositories.hseTrainings.getAll();
    dispatch({ type: 'SET_HSE_TRAININGS', payload: trainings });
  }, [dispatch, state.hseTrainings]);

  // Utilitaires
  const getTrainingBySessionId = useCallback((sessionId: string): HSETraining | undefined => {
    return state.hseTrainings.find(training => 
      training.sessions.some(session => session.id === sessionId)
    );
  }, [state.hseTrainings]);

  const getSessionById = useCallback((sessionId: string): { training: HSETraining; session: HSETrainingSession } | undefined => {
    for (const training of state.hseTrainings) {
      const session = training.sessions.find(s => s.id === sessionId);
      if (session) {
        return { training, session };
      }
    }
    return undefined;
  }, [state.hseTrainings]);

  // Requêtes et filtres
  const getUpcomingSessions = useCallback((days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    const upcomingSessions: Array<{ training: HSETraining; session: HSETrainingSession }> = [];
    
    state.hseTrainings.forEach(training => {
      training.sessions.forEach(session => {
        if (session.date <= cutoffDate && session.date >= new Date() && session.status === 'scheduled') {
          upcomingSessions.push({ training, session });
        }
      });
    });
    
    return upcomingSessions.sort((a, b) => a.session.date.getTime() - b.session.date.getTime());
  }, [state.hseTrainings]);

  const getTrainingsByRole = useCallback((role: UserRole) => {
    return state.hseTrainings.filter(training => 
      training.requiredForRoles.includes(role)
    );
  }, [state.hseTrainings]);

  const getEmployeeTrainings = useCallback(async (employeeId: string) => {
    return await repositories.hseTrainings.getEmployeeTrainings(employeeId);
  }, []);

  const getExpiredTrainings = useCallback((employeeId: string) => {
    const now = new Date();
    const expiredTrainings: Array<{ training: HSETraining; attendance: HSEAttendance }> = [];
    
    state.hseTrainings.forEach(training => {
      training.sessions.forEach(session => {
        const attendance = session.attendance.find(a => 
          a.employeeId === employeeId && 
          a.status === 'completed' &&
          a.expirationDate &&
          a.expirationDate < now
        );
        
        if (attendance) {
          expiredTrainings.push({ training, attendance });
        }
      });
    });
    
    return expiredTrainings;
  }, [state.hseTrainings]);

  const getExpiringTrainings = useCallback((employeeId: string, days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    const expiringTrainings: Array<{ training: HSETraining; attendance: HSEAttendance; daysUntilExpiry: number }> = [];
    
    state.hseTrainings.forEach(training => {
      training.sessions.forEach(session => {
        const attendance = session.attendance.find(a => 
          a.employeeId === employeeId && 
          a.status === 'completed' &&
          a.expirationDate &&
          a.expirationDate <= cutoffDate &&
          a.expirationDate > new Date()
        );
        
        if (attendance && attendance.expirationDate) {
          const daysUntilExpiry = Math.ceil(
            (attendance.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          expiringTrainings.push({ training, attendance, daysUntilExpiry });
        }
      });
    });
    
    return expiringTrainings.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [state.hseTrainings]);

  // Calcul de conformité
  const getComplianceRate = useCallback((serviceOrRole?: string) => {
    if (!state.employees.length) return 0;
    
    let targetEmployees = state.employees;
    
    if (serviceOrRole) {
      // Filtrer par service ou par rôle
      targetEmployees = state.employees.filter(emp => 
        emp.service === serviceOrRole || emp.roles.includes(serviceOrRole as UserRole)
      );
    }
    
    if (targetEmployees.length === 0) return 100;
    
    let totalCompliant = 0;
    
    targetEmployees.forEach(employee => {
      const requiredTrainings = state.hseTrainings.filter(training =>
        training.requiredForRoles.some(role => employee.roles.includes(role))
      );
      
      if (requiredTrainings.length === 0) {
        totalCompliant++;
        return;
      }
      
      let employeeCompliant = true;
      
      for (const training of requiredTrainings) {
        let hasValidCertification = false;
        
        for (const session of training.sessions) {
          const attendance = session.attendance.find(a => 
            a.employeeId === employee.id &&
            a.status === 'completed' &&
            a.expirationDate &&
            a.expirationDate > new Date()
          );
          
          if (attendance) {
            hasValidCertification = true;
            break;
          }
        }
        
        if (!hasValidCertification) {
          employeeCompliant = false;
          break;
        }
      }
      
      if (employeeCompliant) {
        totalCompliant++;
      }
    });
    
    return Math.round((totalCompliant / targetEmployees.length) * 100);
  }, [state.hseTrainings, state.employees]);

  // Génération d'alertes
  const generateTrainingAlerts = useCallback(() => {
    const alerts: HSENotification[] = [];
    
    state.employees.forEach(employee => {
      const expiring = getExpiringTrainings(employee.id, 30);
      
      if (expiring.length > 0) {
        alerts.push({
          id: generateId(),
          type: 'hse_training_expiring',
          title: 'Formations à renouveler',
          message: `${expiring.length} formation(s) expire(nt) bientôt pour ${employee.firstName} ${employee.lastName}`,
          timestamp: new Date(),
          read: false,
          metadata: { 
            employeeId: employee.id, 
            daysUntilExpiry: Math.min(...expiring.map(e => e.daysUntilExpiry))
          }
        });
      }
    });
    
    return alerts;
  }, [state.employees, getExpiringTrainings]);

  // Statistiques
  const getStats = useCallback(() => {
    const upcoming = getUpcomingSessions(7);
    const allSessions = state.hseTrainings.reduce((sum, t) => sum + t.sessions.length, 0);
    const completedSessions = state.hseTrainings.reduce((sum, t) => 
      sum + t.sessions.filter(s => s.status === 'completed').length, 0
    );
    const overallCompliance = getComplianceRate();
    
    return {
      scheduled: upcoming.length,
      completed: completedSessions,
      compliance: overallCompliance,
      totalTrainings: state.hseTrainings.length,
      totalSessions: allSessions,
      completionRate: allSessions > 0 ? Math.round((completedSessions / allSessions) * 100) : 0
    };
  }, [state.hseTrainings, getUpcomingSessions, getComplianceRate]);

  return {
    // État
    trainings: state.hseTrainings,
    loading,
    error,
    initialized,
    
    // Actions
    initializeTrainings,
    addTraining,
    updateTraining,
    deleteTraining,
    addSession,
    registerEmployee,
    markAttendance,
    
    // Queries
    getTrainingBySessionId,
    getSessionById,
    getUpcomingSessions,
    getTrainingsByRole,
    getEmployeeTrainings,
    getExpiredTrainings,
    getExpiringTrainings,
    getComplianceRate,
    generateTrainingAlerts,
    getStats,
  };
}
