import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { Employee, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';
import { convex, convexClientAvailable } from '@/lib/convexClient';

export function useEmployees() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (convexClientAvailable) {
          const result = await convex.query('employees:list', {});
          if (!cancelled && Array.isArray(result)) {
            const mapped = result.map((e: any) => ({
              id: String(e._id ?? e.id),
              firstName: e.firstName,
              lastName: e.lastName,
              matricule: e.matricule,
              service: e.service,
              roles: e.roles || [],
              competences: e.competences || [],
              habilitations: e.habilitations || [],
              email: e.email,
              status: e.status ?? 'active',
              stats: e.stats ?? { visitsReceived: 0, packagesReceived: 0, hseTrainingsCompleted: 0 },
              equipmentIds: e.equipmentIds ?? [],
              createdAt: new Date(e.createdAt ?? Date.now()),
              updatedAt: new Date(e.updatedAt ?? Date.now()),
            })) as Employee[];
            dispatch({ type: 'SET_EMPLOYEES', payload: mapped });
            return;
          }
        }
      } catch (_) {}
      const local = repositories.employees.getAll();
      if (!cancelled) dispatch({ type: 'SET_EMPLOYEES', payload: local });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const createEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (convexClientAvailable) {
        const created = await convex.mutation('employees:create', employeeData);
        if (created) {
          const mapped: Employee = {
            id: String(created._id ?? created.id),
            firstName: created.firstName,
            lastName: created.lastName,
            matricule: created.matricule,
            service: created.service,
            roles: created.roles || [],
            competences: created.competences || [],
            habilitations: created.habilitations || [],
            email: created.email,
            status: created.status ?? 'active',
            stats: created.stats ?? { visitsReceived: 0, packagesReceived: 0, hseTrainingsCompleted: 0 },
            equipmentIds: created.equipmentIds ?? [],
            createdAt: new Date(created.createdAt ?? Date.now()),
            updatedAt: new Date(created.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'ADD_EMPLOYEE', payload: mapped });
          toast({ title: 'Employé créé', description: `${mapped.firstName} ${mapped.lastName} a été ajouté avec succès.` });
          return mapped;
        }
      }
      const fallback = repositories.employees.create(employeeData);
      dispatch({ type: 'ADD_EMPLOYEE', payload: fallback });
      toast({ title: 'Employé créé', description: `${fallback.firstName} ${fallback.lastName} a été ajouté avec succès.` });
      return fallback;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer l\'employé.', variant: 'destructive' });
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      if (convexClientAvailable) {
        const updated = await convex.mutation('employees:update', { id, updates });
        if (updated) {
          const mapped: Employee = {
            id: String(updated._id ?? updated.id),
            firstName: updated.firstName,
            lastName: updated.lastName,
            matricule: updated.matricule,
            service: updated.service,
            roles: updated.roles || [],
            competences: updated.competences || [],
            habilitations: updated.habilitations || [],
            email: updated.email,
            status: updated.status ?? 'active',
            stats: updated.stats ?? { visitsReceived: 0, packagesReceived: 0, hseTrainingsCompleted: 0 },
            equipmentIds: updated.equipmentIds ?? [],
            createdAt: new Date(updated.createdAt ?? Date.now()),
            updatedAt: new Date(updated.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'UPDATE_EMPLOYEE', payload: mapped });
          toast({ title: 'Employé mis à jour', description: 'Les informations ont été sauvegardées.' });
          return mapped;
        }
      }
      const local = repositories.employees.update(id, updates);
      if (local) {
        dispatch({ type: 'UPDATE_EMPLOYEE', payload: local });
        toast({ title: 'Employé mis à jour', description: 'Les informations ont été sauvegardées.' });
      }
      return local;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour l\'employé.', variant: 'destructive' });
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      let success = false;
      if (convexClientAvailable) {
        const res = await convex.mutation('employees:delete', { id });
        success = !!(res ?? true);
      }
      if (!convexClientAvailable) {
        success = repositories.employees.delete(id);
      }
      if (success) {
        dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
        toast({ title: 'Employé supprimé', description: 'L\'employé a été retiré du système.' });
      }
      return success;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'employé.', variant: 'destructive' });
      throw error;
    }
  };

  const getEmployeesByRole = (role: UserRole) => {
    return state.employees.filter(emp => emp.roles.includes(role));
  };

  const getEmployeeById = (id: string) => {
    return state.employees.find(emp => emp.id === id);
  };

  return {
    employees: state.employees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByRole,
    getEmployeeById,
  };
}