import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { Visit, Visitor, VisitStatus } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useVisits() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const visits = repositories.visits.getAll();
    const visitors = repositories.visitors.getAll();
    dispatch({ type: 'SET_VISITS', payload: visits });
    dispatch({ type: 'SET_VISITORS', payload: visitors });
  }, [dispatch]);

  const createVisitor = (visitorData: Omit<Visitor, 'id' | 'createdAt'>) => {
    try {
      const newVisitor = repositories.visitors.create(visitorData);
      dispatch({ type: 'ADD_VISITOR', payload: newVisitor });
      return newVisitor;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le visiteur.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createVisit = (visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newVisit = repositories.visits.create(visitData);
      dispatch({ type: 'ADD_VISIT', payload: newVisit });
      
      repositories.notifications.create({
        type: 'info',
        title: 'Nouvelle visite programmée',
        message: `Une visite est programmée pour ${new Date(visitData.scheduledAt).toLocaleString()}`,
        metadata: { visitId: newVisit.id },
      });
      
      toast({
        title: 'Visite créée',
        description: 'La visite a été enregistrée avec succès.',
      });
      return newVisit;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la visite.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateVisitStatus = (visitId: string, status: VisitStatus) => {
    try {
      const updates: Partial<Visit> = { status };
      
      if (status === 'in_progress') {
        updates.checkedInAt = new Date();
      } else if (status === 'checked_out') {
        updates.checkedOutAt = new Date();
      }

      const updatedVisit = repositories.visits.update(visitId, updates);
      if (updatedVisit) {
        dispatch({ type: 'UPDATE_VISIT', payload: updatedVisit });
        
        const statusMessages = {
          waiting: 'Le visiteur est en attente',
          in_progress: 'Le visiteur est arrivé',
          checked_out: 'Le visiteur est sorti',
          expected: 'Visite programmée',
        };
        
        toast({
          title: 'Statut mis à jour',
          description: statusMessages[status],
        });
        return updatedVisit;
      }
      return null;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut.',
        variant: 'destructive',
      });
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