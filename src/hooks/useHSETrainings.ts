import { useMemo, useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { HSETraining, HSETrainingModule, HSETrainingProgress, HSETrainingSession, HSEAttendance } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Id } from "../../convex/_generated/dataModel";
import { repositories } from '@/services/repositories';

export function useHSETrainings() {
  // Queries Convex
  const trainingsData = useQuery(api.hseTrainings.list);

  // Fallback local
  const [fallbackTrainings, setFallbackTrainings] = useState<any[] | null>(null);
  const [fallbackReady, setFallbackReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (trainingsData === undefined && !fallbackReady) {
      (async () => {
        try {
          const list = await repositories.hseTrainings.getAll();
          if (!cancelled) {
            setFallbackTrainings(list as any[]);
            setFallbackReady(true);
          }
        } catch (_) {
          if (!cancelled) setFallbackReady(true);
        }
      })();
    }
    return () => { cancelled = true; };
  }, [trainingsData, fallbackReady]);

  // Mutations Convex
  const createMutation = useMutation(api.hseTrainings.create);
  const updateMutation = useMutation(api.hseTrainings.update);
  const startTrainingMutation = useMutation(api.hseTrainings.startTraining);
  const completeTrainingMutation = useMutation(api.hseTrainings.completeTraining);
  const removeMutation = useMutation(api.hseTrainings.remove);

  // Mapper les données (Convex si dispo, sinon fallback)
  const trainings: HSETrainingModule[] = useMemo(() => (
    (trainingsData || fallbackTrainings || []).map((t: any) => ({
      id: t._id,
      code: t.code,
      title: t.title,
      category: t.category,
      description: t.description,
      objectives: t.objectives,
      duration: t.duration,
      durationUnit: t.durationUnit,
      validityMonths: t.validityMonths,
      requiredForRoles: t.requiredForRoles,
      prerequisites: t.prerequisites,
      content: t.content,
      certification: t.certification,
      instructor: { qualificationRequired: '', minExperience: '' },
      maxParticipants: t.maxParticipants,
      language: t.language,
      deliveryMethods: t.deliveryMethods,
      refresherRequired: t.refresherRequired,
      refresherFrequency: t.refresherFrequency,
      // Fournir toujours un tableau de sessions utilisable par les composants
      sessions: Array.isArray(t.sessions)
        ? t.sessions.map((s: any) => ({
            id: s.id || s._id || `${t._id}-sess-${Math.random().toString(36).slice(2)}`,
            trainingId: s.trainingId || t._id,
            date: s.date instanceof Date ? s.date : new Date(s.date),
            instructor: s.instructor || '',
            location: s.location || '',
            maxParticipants: s.maxParticipants || (t.maxParticipants ?? 15),
            attendance: Array.isArray(s.attendance) ? s.attendance : [],
            status: s.status || 'scheduled',
          }))
        : [],
    }))
  ), [trainingsData, fallbackTrainings]);

  const createTraining = async (trainingData: Omit<HSETrainingModule, 'id'>) => {
    try {
      await createMutation({
        code: trainingData.code,
        title: trainingData.title,
        category: trainingData.category,
        description: trainingData.description,
        objectives: trainingData.objectives,
        duration: trainingData.duration,
        durationUnit: trainingData.durationUnit,
        validityMonths: trainingData.validityMonths,
        requiredForRoles: trainingData.requiredForRoles,
        prerequisites: trainingData.prerequisites,
        content: trainingData.content,
        certification: trainingData.certification,
        maxParticipants: trainingData.maxParticipants,
        language: trainingData.language,
        deliveryMethods: trainingData.deliveryMethods,
        refresherRequired: trainingData.refresherRequired,
        refresherFrequency: trainingData.refresherFrequency,
      });

      toast({
        title: 'Formation créée',
        description: `${trainingData.title} a été ajoutée au catalogue.`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer la formation.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  const startTraining = async (employeeId: string, trainingId: string) => {
    try {
      await startTrainingMutation({
        employeeId: employeeId as Id<"employees">,
        trainingId: trainingId as Id<"hseTrainings">,
      });
      
      toast({
        title: 'Formation démarrée',
        description: 'La formation a été démarrée pour l\'employé.',
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de démarrer la formation.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  const completeTraining = async (progressId: string, score: number) => {
    try {
      await completeTrainingMutation({
        progressId: progressId as Id<"trainingProgress">,
        score,
      });

      toast({
        title: 'Formation terminée',
        description: 'Le certificat a été généré avec succès.',
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de terminer la formation.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  const getTrainingByCode = (code: string) => {
    return trainings.find(t => t.code === code);
  };

  const getTrainingsByCategory = (category: string) => {
    return trainings.filter(t => t.category === category);
  };

  const getStats = () => {
    const total = trainings.length;
    const byCategory = trainings.reduce<Record<string, number>>((acc, t) => {
      const key = t.category || 'autre';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const refresherRequired = trainings.filter(t => t.refresherRequired).length;
    const totalSessions = trainings.reduce((sum, t: any) => {
      const sessions = Array.isArray(t.sessions) ? t.sessions : [];
      return sum + sessions.length;
    }, 0);
    return { total, byCategory, refresherRequired, totalSessions };
  };

  const getUpcomingSessions = (daysAhead: number) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const sessions: Array<{ training: any; session: any }> = [];
    (trainingsData || fallbackTrainings || []).forEach((t: any) => {
      const list = Array.isArray(t.sessions) ? t.sessions : [];
      list.forEach((s: any) => {
        const date = new Date(s.date);
        if (date <= cutoff && date >= now) {
          sessions.push({ training: t, session: { ...s, date } });
        }
      });
    });
    return sessions.sort((a, b) => a.session.date.getTime() - b.session.date.getTime());
  };

  // Fonctions complémentaires utilisées par useHSECompliance
  const getExpiredTrainings = (employeeId: string) => {
    const result: Array<{ trainingId: string; title: string; expiredOn: Date } > = [];
    (trainings as any[]).forEach((t: any) => {
      const sessions: HSETrainingSession[] = Array.isArray(t.sessions) ? t.sessions : [];
      sessions.forEach((s) => {
        const att = (s.attendance || []).find((a: HSEAttendance) => a.employeeId === employeeId && a.status === 'completed' && a.expirationDate);
        if (att?.expirationDate && att.expirationDate < new Date()) {
          result.push({ trainingId: t.id, title: t.title, expiredOn: att.expirationDate });
        }
      });
    });
    return result;
  };

  const getExpiringTrainings = (employeeId: string, daysAhead: number) => {
    const result: Array<{ trainingId: string; title: string; daysUntilExpiry: number } > = [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);
    (trainings as any[]).forEach((t: any) => {
      const sessions: HSETrainingSession[] = Array.isArray(t.sessions) ? t.sessions : [];
      sessions.forEach((s) => {
        const att = (s.attendance || []).find((a: HSEAttendance) => a.employeeId === employeeId && a.status === 'completed' && a.expirationDate);
        if (att?.expirationDate && att.expirationDate > new Date() && att.expirationDate <= cutoff) {
          const daysUntilExpiry = Math.ceil((att.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          result.push({ trainingId: t.id, title: t.title, daysUntilExpiry });
        }
      });
    });
    return result.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  };

  // Création d'une session (fallback local via repository)
  const addSession = async (trainingId: string, session: Omit<HSETrainingSession, 'id' | 'attendance'>) => {
    try {
      const created = await repositories.hseTrainings.createSession(trainingId, session);
      if (created) {
        // Rafraîchir le fallback local en mémoire
        setFallbackTrainings((prev) => {
          if (!prev) return prev;
          return prev.map((t: any) => t.id === trainingId || t._id === trainingId
            ? { ...t, sessions: [...(t.sessions || []), created] }
            : t
          );
        });
      }
      return created;
    } catch (e) {
      return null;
    }
  };

  const initializeTrainings = useCallback(async () => true, []);

  return {
    trainings,
    loading: trainingsData === undefined && !fallbackReady,
    error: null as string | null,
    initialized: trainingsData !== undefined || fallbackReady,
    createTraining,
    startTraining,
    completeTraining,
    addSession,
    getTrainingByCode,
    getTrainingsByCategory,
    getStats,
    getUpcomingSessions,
    getExpiredTrainings,
    getExpiringTrainings,
    initializeTrainings,
  };
}
