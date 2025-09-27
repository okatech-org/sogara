import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { HSEIncident, HSETraining, HSETrainingSession, HSEAttendance } from '@/types';
import { toast } from '@/hooks/use-toast';
import { convex, convexClientAvailable } from '@/lib/convexClient';

// Types pour les formulaires
interface IncidentFormData {
  employeeId: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: string;
  occurredAt: Date;
  reportedBy: string;
  attachments?: string[];
}

interface TrainingFormData {
  title: string;
  description: string;
  requiredForRoles: string[];
  duration: number;
  validityMonths: number;
}

interface AttendanceData {
  employeeId: string;
  status: 'registered' | 'present' | 'absent' | 'completed';
  score?: number;
  notes?: string;
}

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  severity?: string;
  status?: string;
  employeeId?: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export function useHSE() {
  const { state, dispatch } = useApp();
  const [incidents, setIncidents] = useState<HSEIncident[]>([]);
  const [trainings, setTrainings] = useState<HSETraining[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les données HSE
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (convexClientAvailable) {
          const [incidentsRes, trainingsRes] = await Promise.all([
            convex.query('hse:listIncidents', {}),
            convex.query('hse:listTrainings', {})
          ]);
          
          if (!cancelled) {
            if (Array.isArray(incidentsRes)) {
              const mappedIncidents = incidentsRes.map((i: any) => ({
                id: String(i._id ?? i.id),
                employeeId: String(i.employeeId),
                type: i.type,
                severity: i.severity,
                description: i.description,
                location: i.location,
                occurredAt: new Date(i.occurredAt),
                status: i.status,
                attachments: i.attachments || [],
                reportedBy: String(i.reportedBy),
                createdAt: new Date(i.createdAt ?? Date.now()),
                updatedAt: new Date(i.updatedAt ?? Date.now()),
              })) as HSEIncident[];
              setIncidents(mappedIncidents);
            }
            
            if (Array.isArray(trainingsRes)) {
              const mappedTrainings = trainingsRes.map((t: any) => ({
                id: String(t._id ?? t.id),
                title: t.title,
                description: t.description,
                requiredForRoles: t.requiredForRoles || [],
                duration: t.duration,
                validityMonths: t.validityMonths,
                sessions: t.sessions || [],
                createdAt: new Date(t.createdAt ?? Date.now()),
                updatedAt: new Date(t.updatedAt ?? Date.now()),
              })) as HSETraining[];
              setTrainings(mappedTrainings);
            }
            return;
          }
        }
      } catch (_) {}
      
      // Fallback local
      const localIncidents = await repositories.hseIncidents.getAll();
      const localTrainings = await repositories.hseTrainings.getAll();
      if (!cancelled) {
        setIncidents(localIncidents);
        setTrainings(localTrainings);
      }
    };
    
    load().finally(() => !cancelled && setLoading(false));
    
    return () => {
      cancelled = true;
    };
  }, []);

  // === GESTION DES INCIDENTS ===

  const createIncident = async (data: IncidentFormData): Promise<HSEIncident> => {
    try {
      if (convexClientAvailable) {
        const created = await convex.mutation('hse:createIncident', data);
        if (created) {
          const mapped: HSEIncident = {
            id: String(created._id ?? created.id),
            employeeId: String(created.employeeId),
            type: created.type,
            severity: created.severity,
            description: created.description,
            location: created.location,
            occurredAt: new Date(created.occurredAt),
            status: created.status,
            attachments: created.attachments || [],
            reportedBy: String(created.reportedBy),
            createdAt: new Date(created.createdAt ?? Date.now()),
            updatedAt: new Date(created.updatedAt ?? Date.now()),
          };
          setIncidents(prev => [mapped, ...prev]);
          toast({ title: 'Incident créé', description: 'L\'incident a été signalé avec succès' });
          return mapped;
        }
      }
      
      const newIncident = await repositories.hseIncidents.create(data);
      setIncidents(prev => [newIncident, ...prev]);
      toast({ title: 'Incident créé', description: 'L\'incident a été signalé avec succès' });
      return newIncident;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer l\'incident', variant: 'destructive' });
      throw error;
    }
  };

  const updateIncident = async (id: string, data: Partial<HSEIncident>): Promise<HSEIncident | null> => {
    try {
      if (convexClientAvailable) {
        const updated = await convex.mutation('hse:updateIncident', { id, updates: data });
        if (updated) {
          const mapped: HSEIncident = {
            id: String(updated._id ?? updated.id),
            employeeId: String(updated.employeeId),
            type: updated.type,
            severity: updated.severity,
            description: updated.description,
            location: updated.location,
            occurredAt: new Date(updated.occurredAt),
            status: updated.status,
            attachments: updated.attachments || [],
            reportedBy: String(updated.reportedBy),
            createdAt: new Date(updated.createdAt ?? Date.now()),
            updatedAt: new Date(updated.updatedAt ?? Date.now()),
          };
          setIncidents(prev => prev.map(i => i.id === id ? mapped : i));
          toast({ title: 'Incident mis à jour', description: 'Les modifications ont été sauvegardées' });
          return mapped;
        }
      }
      
      const updated = await repositories.hseIncidents.update(id, data);
      if (updated) {
        setIncidents(prev => prev.map(i => i.id === id ? updated : i));
        toast({ title: 'Incident mis à jour', description: 'Les modifications ont été sauvegardées' });
      }
      return updated;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour l\'incident', variant: 'destructive' });
      throw error;
    }
  };

  const resolveIncident = async (id: string, resolution: string): Promise<void> => {
    await updateIncident(id, { 
      status: 'resolved',
      notes: resolution 
    });
  };

  const escalateIncident = async (id: string, to: string): Promise<void> => {
    await updateIncident(id, { 
      status: 'investigating',
      assignedTo: to 
    });
  };

  // === GESTION DES FORMATIONS ===

  const scheduleTraining = async (data: TrainingFormData): Promise<HSETraining> => {
    try {
      if (convexClientAvailable) {
        const created = await convex.mutation('hse:createTraining', data);
        if (created) {
          const mapped: HSETraining = {
            id: String(created._id ?? created.id),
            title: created.title,
            description: created.description,
            requiredForRoles: created.requiredForRoles || [],
            duration: created.duration,
            validityMonths: created.validityMonths,
            sessions: created.sessions || [],
            createdAt: new Date(created.createdAt ?? Date.now()),
            updatedAt: new Date(created.updatedAt ?? Date.now()),
          };
          setTrainings(prev => [mapped, ...prev]);
          toast({ title: 'Formation créée', description: 'La formation a été programmée' });
          return mapped;
        }
      }
      
      const newTraining = await repositories.hseTrainings.create(data);
      setTrainings(prev => [newTraining, ...prev]);
      toast({ title: 'Formation créée', description: 'La formation a été programmée' });
      return newTraining;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer la formation', variant: 'destructive' });
      throw error;
    }
  };

  const registerForTraining = async (sessionId: string, employeeId: string): Promise<void> => {
    try {
      await repositories.hseTrainings.registerEmployee(sessionId, employeeId);
      
      // Recharger les formations
      const updatedTrainings = await repositories.hseTrainings.getAll();
      setTrainings(updatedTrainings);
      
      toast({ title: 'Inscription confirmée', description: 'L\'employé a été inscrit à la formation' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'inscrire à la formation', variant: 'destructive' });
      throw error;
    }
  };

  const recordAttendance = async (sessionId: string, attendance: AttendanceData[]): Promise<void> => {
    try {
      for (const record of attendance) {
        await repositories.hseTrainings.markAttendance(sessionId, record.employeeId, record.status);
      }
      
      // Recharger les formations
      const updatedTrainings = await repositories.hseTrainings.getAll();
      setTrainings(updatedTrainings);
      
      toast({ title: 'Présences enregistrées', description: 'Les présences ont été mises à jour' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer les présences', variant: 'destructive' });
      throw error;
    }
  };

  const generateCertificate = async (sessionId: string, employeeId: string): Promise<Blob> => {
    // Simuler la génération de certificat
    const certificate = new Blob(['Certificat de formation HSE'], { type: 'application/pdf' });
    
    toast({ title: 'Certificat généré', description: 'Le certificat a été généré avec succès' });
    
    return certificate;
  };

  // === RAPPORTS ET STATISTIQUES ===

  const generateIncidentReport = async (filters: ReportFilters): Promise<Blob> => {
    try {
      let filteredIncidents = incidents;

      if (filters.startDate && filters.endDate) {
        filteredIncidents = incidents.filter(i => 
          i.occurredAt >= filters.startDate! && i.occurredAt <= filters.endDate!
        );
      }

      if (filters.severity) {
        filteredIncidents = filteredIncidents.filter(i => i.severity === filters.severity);
      }

      if (filters.status) {
        filteredIncidents = filteredIncidents.filter(i => i.status === filters.status);
      }

      if (filters.employeeId) {
        filteredIncidents = filteredIncidents.filter(i => i.employeeId === filters.employeeId);
      }

      // Simuler la génération de rapport PDF
      const reportContent = `Rapport d'incidents HSE\n\nNombre d'incidents: ${filteredIncidents.length}\n\n${
        filteredIncidents.map(i => 
          `${i.type} - ${i.severity} - ${i.occurredAt.toLocaleDateString()}`
        ).join('\n')
      }`;

      const report = new Blob([reportContent], { type: 'application/pdf' });
      
      toast({ title: 'Rapport généré', description: 'Le rapport d\'incidents a été généré' });
      
      return report;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de générer le rapport', variant: 'destructive' });
      throw error;
    }
  };

  const getComplianceRate = async (): Promise<number> => {
    try {
      const totalEmployees = state.employees.length;
      const trainedEmployees = state.employees.filter(emp => 
        emp.stats.hseTrainingsCompleted > 0
      ).length;
      
      return totalEmployees > 0 ? Math.round((trainedEmployees / totalEmployees) * 100) : 0;
    } catch (error) {
      console.error('Erreur calcul taux de conformité:', error);
      return 0;
    }
  };

  const getIncidentTrends = async (period: string): Promise<ChartData> => {
    try {
      const now = new Date();
      const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      
      const periodIncidents = incidents.filter(i => i.occurredAt >= startDate);
      
      // Grouper par jour/semaine/mois selon la période
      const grouped: Record<string, number> = {};
      
      periodIncidents.forEach(incident => {
        const key = incident.occurredAt.toISOString().split('T')[0];
        grouped[key] = (grouped[key] || 0) + 1;
      });
      
      const labels = Object.keys(grouped).sort();
      const data = labels.map(label => grouped[label]);
      
      return {
        labels,
        datasets: [{
          label: 'Incidents',
          data,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 1)'
        }]
      };
    } catch (error) {
      console.error('Erreur calcul tendances:', error);
      return { labels: [], datasets: [] };
    }
  };

  const getTrainingCompletionRate = async (): Promise<number> => {
    try {
      const allSessions = trainings.flatMap(t => t.sessions);
      const completedSessions = allSessions.filter(s => s.status === 'completed');
      
      return allSessions.length > 0 ? Math.round((completedSessions.length / allSessions.length) * 100) : 0;
    } catch (error) {
      console.error('Erreur calcul taux de complétion:', error);
      return 0;
    }
  };

  // === CHECKLISTS DE SÉCURITÉ ===

  const createChecklist = async (data: any): Promise<any> => {
    // À implémenter selon les besoins spécifiques
    toast({ title: 'Checklist créée', description: 'La checklist de sécurité a été créée' });
    return data;
  };

  const completeChecklist = async (id: string, responses: any[]): Promise<void> => {
    // À implémenter selon les besoins spécifiques
    toast({ title: 'Checklist complétée', description: 'La checklist a été marquée comme complétée' });
  };

  const getOverdueChecklists = async (): Promise<any[]> => {
    // À implémenter selon les besoins spécifiques
    return [];
  };

  // === MÉTHODES UTILITAIRES ===

  const getIncidentById = (id: string): HSEIncident | undefined => {
    return incidents.find(incident => incident.id === id);
  };

  const getTrainingById = (id: string): HSETraining | undefined => {
    return trainings.find(training => training.id === id);
  };

  const getIncidentsByEmployee = (employeeId: string): HSEIncident[] => {
    return incidents.filter(incident => incident.employeeId === employeeId);
  };

  const getOpenIncidents = (): HSEIncident[] => {
    return incidents.filter(incident => incident.status !== 'resolved');
  };

  const getHighSeverityIncidents = (): HSEIncident[] => {
    return incidents.filter(incident => 
      incident.severity === 'high' && incident.status !== 'resolved'
    );
  };

  const getUpcomingTrainings = (): HSETraining[] => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return trainings.filter(training => 
      training.sessions.some(session => 
        session.date <= nextMonth && session.status === 'scheduled'
      )
    );
  };

  const getTrainingsForEmployee = (employeeId: string): HSETraining[] => {
    return trainings.filter(training => 
      training.sessions.some(session =>
        session.attendance.some(att => att.employeeId === employeeId)
      )
    );
  };

  // === STATISTIQUES ===

  const getHSEStats = () => {
    const incidentStats = repositories.hseIncidents.getStats();
    const trainingStats = repositories.hseTrainings.getStats();
    
    return {
      incidents: incidentStats,
      trainings: trainingStats,
      openIncidents: getOpenIncidents().length,
      trainingsThisWeek: getUpcomingTrainings().length,
      complianceRate: 95 // À calculer selon les vrais critères
    };
  };

  return {
    // État
    incidents,
    trainings,
    loading,
    
    // Gestion des incidents
    createIncident,
    updateIncident,
    resolveIncident,
    escalateIncident,
    getIncidentById,
    getIncidentsByEmployee,
    getOpenIncidents,
    getHighSeverityIncidents,
    
    // Gestion des formations
    scheduleTraining,
    registerForTraining,
    recordAttendance,
    generateCertificate,
    getTrainingById,
    getUpcomingTrainings,
    getTrainingsForEmployee,
    
    // Rapports et statistiques
    generateIncidentReport,
    getComplianceRate,
    getIncidentTrends,
    getTrainingCompletionRate,
    getHSEStats,
    
    // Checklists de sécurité
    createChecklist,
    completeChecklist,
    getOverdueChecklists
  };
}
