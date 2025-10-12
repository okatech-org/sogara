import { useMemo, useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { HSEIncident } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Id } from "../../convex/_generated/dataModel";
import { repositories } from '@/services/repositories';

export function useHSEIncidents() {
  // Queries Convex
  const incidentsData = useQuery(api.hseIncidents.list);

  // Fallback local si Convex n'est pas disponible
  const [fallbackIncidents, setFallbackIncidents] = useState<HSEIncident[] | null>(null);
  const [fallbackReady, setFallbackReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (incidentsData === undefined && !fallbackReady) {
      // Charger depuis localStorage via repositories
      (async () => {
        try {
          const list = await repositories.hseIncidents.getAll();
          if (!cancelled) {
            setFallbackIncidents(list);
            setFallbackReady(true);
          }
        } catch (_) {
          if (!cancelled) setFallbackReady(true);
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [incidentsData, fallbackReady]);

  // Mutations Convex
  const createMutation = useMutation(api.hseIncidents.create);
  const updateMutation = useMutation(api.hseIncidents.update);
  const assignInvestigatorMutation = useMutation(api.hseIncidents.assignInvestigator);
  const resolveMutation = useMutation(api.hseIncidents.resolve);
  const removeMutation = useMutation(api.hseIncidents.remove);

  // Mapper les données (Convex si dispo, sinon fallback local)
  const incidents: HSEIncident[] = useMemo(() => {
    if (incidentsData) {
      return (incidentsData as any[]).map((i: any) => ({
        id: i._id,
        employeeId: i.employeeId,
        type: i.type,
        severity: i.severity,
        description: i.description,
        location: i.location,
        occurredAt: new Date(i.occurredAt),
        status: i.status,
        attachments: i.attachments,
        reportedBy: i.reportedBy,
        investigatedBy: i.investigatedBy,
        correctiveActions: i.correctiveActions,
        createdAt: new Date(i._creationTime),
        updatedAt: new Date(i._creationTime),
      }));
    }
    return fallbackIncidents || [];
  }, [incidentsData, fallbackIncidents]);

  const createIncident = async (incidentData: Omit<HSEIncident, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      await createMutation({
        employeeId: incidentData.employeeId as Id<"employees">,
        type: incidentData.type,
        severity: incidentData.severity,
        description: incidentData.description,
        location: incidentData.location,
        occurredAt: incidentData.occurredAt.getTime(),
        reportedBy: incidentData.reportedBy as Id<"employees">,
        attachments: incidentData.attachments,
      });

      toast({
        title: 'Incident déclaré',
        description: 'L\'incident a été enregistré avec succès.',
      });

      return { success: true };
    } catch (error: any) {
      // Fallback local
      try {
        const created = await repositories.hseIncidents.create(incidentData);
        setFallbackIncidents((prev) => (prev ? [created, ...prev] : [created]));
        toast({ title: 'Incident déclaré (local)', description: 'Mode hors-ligne, sauvegardé localement.' });
        return { success: true, offline: true } as any;
      } catch (e: any) {
        toast({ title: 'Erreur', description: e?.message || 'Impossible de créer l\'incident.', variant: 'destructive' });
        return { success: false, error: e?.message };
      }
    }
  };

  const updateIncident = async (id: string, updates: Partial<HSEIncident>) => {
    try {
      await updateMutation({
        id: id as Id<"hseIncidents">,
        status: updates.status,
        investigatedBy: updates.investigatedBy as Id<"employees"> | undefined,
        correctiveActions: updates.correctiveActions,
        rootCause: updates.rootCause,
      });

      toast({
        title: 'Incident mis à jour',
        description: 'Les modifications ont été sauvegardées.',
      });

      return { success: true };
    } catch (error: any) {
      try {
        const updated = await repositories.hseIncidents.update(id, updates);
        if (updated) {
          setFallbackIncidents((prev) => prev ? prev.map(i => i.id === id ? updated : i) : [updated]);
          toast({ title: 'Incident mis à jour (local)', description: 'Modifications enregistrées hors-ligne.' });
          return { success: true, offline: true } as any;
        }
        return { success: false };
      } catch (e: any) {
        toast({ title: 'Erreur', description: e?.message || 'Impossible de mettre à jour l\'incident.', variant: 'destructive' });
        return { success: false, error: e?.message };
      }
    }
  };

  const assignInvestigator = async (incidentId: string, investigatorId: string) => {
    try {
      await assignInvestigatorMutation({
        incidentId: incidentId as Id<"hseIncidents">,
        investigatorId: investigatorId as Id<"employees">,
      });

      toast({
        title: 'Enquêteur assigné',
        description: 'L\'enquêteur a été assigné à l\'incident.',
      });

      return { success: true };
    } catch (error: any) {
      // Fallback local direct
      const updated = await repositories.hseIncidents.update(incidentId, { investigatedBy: investigatorId as any });
      if (updated) {
        setFallbackIncidents((prev) => prev ? prev.map(i => i.id === incidentId ? updated : i) : [updated]);
        toast({ title: 'Enquêteur assigné (local)', description: 'Assignation enregistrée hors-ligne.' });
        return { success: true, offline: true } as any;
      }
      return { success: false };
    }
  };

  const resolveIncident = async (incidentId: string, correctiveActions: string, rootCause?: string) => {
    try {
      await resolveMutation({
        incidentId: incidentId as Id<"hseIncidents">,
        correctiveActions,
        rootCause,
      });

      toast({
        title: 'Incident résolu',
        description: 'L\'incident a été marqué comme résolu.',
      });

      return { success: true };
    } catch (error: any) {
      const updated = await repositories.hseIncidents.update(incidentId, { status: 'resolved' as any, correctiveActions, rootCause });
      if (updated) {
        setFallbackIncidents((prev) => prev ? prev.map(i => i.id === incidentId ? updated : i) : [updated]);
        toast({ title: 'Incident résolu (local)', description: 'Résolution enregistrée hors-ligne.' });
        return { success: true, offline: true } as any;
      }
      return { success: false };
    }
  };

  const deleteIncident = async (id: string) => {
    try {
      await removeMutation({ id: id as Id<"hseIncidents"> });

      toast({
        title: 'Incident supprimé',
        description: 'L\'incident a été supprimé du système.',
      });

      return { success: true };
    } catch (error: any) {
      const ok = await repositories.hseIncidents.delete(id);
      if (ok) {
        setFallbackIncidents((prev) => prev ? prev.filter(i => i.id !== id) : []);
        toast({ title: 'Incident supprimé (local)', description: 'Suppression effectuée hors-ligne.' });
        return { success: true, offline: true } as any;
      }
      return { success: false };
    }
  };

  const getIncidentsBySeverity = (severity: 'low' | 'medium' | 'high') => {
    return incidents.filter(i => i.severity === severity);
  };

  const getOpenIncidents = () => {
    return incidents.filter(i => i.status !== 'resolved');
  };

  const getIncidentById = (id: string) => {
    return incidents.find(i => i.id === id);
  };

  const getIncidentsByStatus = (status: string) => {
    return incidents.filter(i => i.status === status);
  };

  const getRecentIncidents = (days: number) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return incidents.filter(i => i.occurredAt >= cutoff)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  };

  const getStats = () => {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const open = incidents.filter(i => i.status !== 'resolved').length;
    const highSeverity = incidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length;
    const thisMonth = incidents.filter(i => i.occurredAt >= monthAgo).length;

    return { open, highSeverity, thisMonth };
  };

  const addIncident = useCallback(async (
    incidentData: Omit<HSEIncident, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => createIncident(incidentData), [createMutation]);

  const initializeIncidents = useCallback(async () => true, []);

  const loading = incidentsData === undefined && !fallbackReady;
  const error: string | null = null;
  const initialized = incidentsData !== undefined || fallbackReady;

  return {
    incidents,
    loading,
    error,
    initialized,
    createIncident,
    updateIncident,
    assignInvestigator,
    resolveIncident,
    deleteIncident,
    addIncident,
    initializeIncidents,
    getIncidentsBySeverity,
    getIncidentsByStatus,
    getRecentIncidents,
    getOpenIncidents,
    getIncidentById,
    getStats,
  };
}
