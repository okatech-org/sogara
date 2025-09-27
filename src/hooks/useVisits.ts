import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { Visit, Visitor, VisitStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { convex, convexClientAvailable } from '@/lib/convexClient';

export function useVisits() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (convexClientAvailable) {
          const [visitsRes, visitorsRes] = await Promise.all([
            convex.query('visits:list', {}),
            convex.query('visitors:list', {}),
          ]);
          if (!cancelled) {
            if (Array.isArray(visitsRes)) {
              const mappedVisits = visitsRes.map((v: any) => ({
                id: String(v._id ?? v.id),
                visitorId: String(v.visitorId),
                hostEmployeeId: String(v.hostEmployeeId),
                scheduledAt: new Date(v.scheduledAt ?? Date.now()),
                checkedInAt: v.checkedInAt ? new Date(v.checkedInAt) : undefined,
                checkedOutAt: v.checkedOutAt ? new Date(v.checkedOutAt) : undefined,
                status: v.status as VisitStatus,
                purpose: v.purpose,
                badgeNumber: v.badgeNumber,
                createdAt: new Date(v.createdAt ?? Date.now()),
                updatedAt: new Date(v.updatedAt ?? Date.now()),
              })) as Visit[];
              dispatch({ type: 'SET_VISITS', payload: mappedVisits });
            }
            if (Array.isArray(visitorsRes)) {
              const mappedVisitors = visitorsRes.map((r: any) => ({
                id: String(r._id ?? r.id),
                firstName: r.firstName,
                lastName: r.lastName,
                company: r.company,
                documentType: r.documentType,
                idDocument: r.idDocument ?? r.documentNumber,
                phone: r.phone,
                email: r.email,
                photo: r.photo,
                createdAt: new Date(r.createdAt ?? Date.now()),
              })) as Visitor[];
              dispatch({ type: 'SET_VISITORS', payload: mappedVisitors });
            }
            return;
          }
        }
      } catch (_) {}
      const visits = repositories.visits.getAll();
      const visitors = repositories.visitors.getAll();
      if (!cancelled) {
        dispatch({ type: 'SET_VISITS', payload: visits });
        dispatch({ type: 'SET_VISITORS', payload: visitors });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const createVisitor = async (visitorData: Omit<Visitor, 'id' | 'createdAt'>) => {
    try {
      if (convexClientAvailable) {
        const created = await convex.mutation('visitors:create', visitorData);
        if (created) {
          const mapped: Visitor = {
            id: String(created._id ?? created.id),
            firstName: created.firstName,
            lastName: created.lastName,
            company: created.company,
            documentType: created.documentType,
            documentNumber: created.documentNumber,
            createdAt: new Date(created.createdAt ?? Date.now()),
          };
          dispatch({ type: 'ADD_VISITOR', payload: mapped });
          return mapped;
        }
      }
      const newVisitor = repositories.visitors.create(visitorData);
      dispatch({ type: 'ADD_VISITOR', payload: newVisitor });
      return newVisitor;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer le visiteur.', variant: 'destructive' });
      throw error;
    }
  };

  const createVisit = async (visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (convexClientAvailable) {
        const created = await convex.mutation('visits:create', visitData);
        if (created) {
          const mapped: Visit = {
            id: String(created._id ?? created.id),
            visitorId: String(created.visitorId),
            hostEmployeeId: String(created.hostEmployeeId),
            scheduledAt: new Date(created.scheduledAt ?? Date.now()),
            checkedInAt: created.checkedInAt ? new Date(created.checkedInAt) : undefined,
            checkedOutAt: created.checkedOutAt ? new Date(created.checkedOutAt) : undefined,
            status: created.status as VisitStatus,
            purpose: created.purpose,
            badgeNumber: created.badgeNumber,
            createdAt: new Date(created.createdAt ?? Date.now()),
            updatedAt: new Date(created.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'ADD_VISIT', payload: mapped });
          toast({ title: 'Visite créée', description: 'La visite a été enregistrée avec succès.' });
          return mapped;
        }
      }
      const newVisit = repositories.visits.create(visitData);
      dispatch({ type: 'ADD_VISIT', payload: newVisit });
      repositories.notifications.create({
        type: 'info',
        title: 'Nouvelle visite programmée',
        message: `Une visite est programmée pour ${new Date(visitData.scheduledAt).toLocaleString()}`,
        metadata: { visitId: newVisit.id },
      });
      toast({ title: 'Visite créée', description: 'La visite a été enregistrée avec succès.' });
      return newVisit;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer la visite.', variant: 'destructive' });
      throw error;
    }
  };

  const updateVisitStatus = async (visitId: string, status: VisitStatus) => {
    try {
      const updates: Partial<Visit> = { status };
      if (status === 'in_progress') updates.checkedInAt = new Date();
      else if (status === 'checked_out') updates.checkedOutAt = new Date();

      if (convexClientAvailable) {
        const updated = await convex.mutation('visits:updateStatus', { id: visitId, status });
        if (updated) {
          const mapped: Visit = {
            id: String(updated._id ?? updated.id),
            visitorId: String(updated.visitorId),
            hostEmployeeId: String(updated.hostEmployeeId),
            scheduledAt: new Date(updated.scheduledAt ?? Date.now()),
            checkedInAt: updated.checkedInAt ? new Date(updated.checkedInAt) : undefined,
            checkedOutAt: updated.checkedOutAt ? new Date(updated.checkedOutAt) : undefined,
            status: updated.status as VisitStatus,
            purpose: updated.purpose,
            badgeNumber: updated.badgeNumber,
            createdAt: new Date(updated.createdAt ?? Date.now()),
            updatedAt: new Date(updated.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'UPDATE_VISIT', payload: mapped });
          const statusMessages = { waiting: 'Le visiteur est en attente', in_progress: 'Le visiteur est arrivé', checked_out: 'Le visiteur est sorti', expected: 'Visite programmée' } as const;
          toast({ title: 'Statut mis à jour', description: statusMessages[status] });
          return mapped;
        }
      }
      const updatedVisit = repositories.visits.update(visitId, updates);
      if (updatedVisit) {
        dispatch({ type: 'UPDATE_VISIT', payload: updatedVisit });
        const statusMessages = { waiting: 'Le visiteur est en attente', in_progress: 'Le visiteur est arrivé', checked_out: 'Le visiteur est sorti', expected: 'Visite programmée' } as const;
        toast({ title: 'Statut mis à jour', description: statusMessages[status] });
      }
      return updatedVisit;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'destructive' });
      throw error;
    }
  };

  const getTodaysVisits = () => {
    const today = new Date().toDateString();
    return state.visits.filter(visit => 
      visit.scheduledAt.toDateString() === today
    );
  };

  const getVisitsByEmployee = (employeeId: string) => {
    return state.visits.filter(visit => visit.hostEmployeeId === employeeId);
  };

  const searchVisitors = (query: string) => {
    const search = query.toLowerCase();
    return state.visitors.filter(visitor =>
      visitor.firstName.toLowerCase().includes(search) ||
      visitor.lastName.toLowerCase().includes(search) ||
      visitor.company.toLowerCase().includes(search)
    );
  };

  const getVisitorById = (id: string) => {
    return state.visitors.find(visitor => visitor.id === id);
  };

  return {
    visits: state.visits,
    visitors: state.visitors,
    createVisitor,
    createVisit,
    updateVisitStatus,
    getTodaysVisits,
    getVisitsByEmployee,
    searchVisitors,
    getVisitorById,
  };
}