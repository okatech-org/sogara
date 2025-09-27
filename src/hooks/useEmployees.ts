import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { Employee, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useEmployees() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const employees = repositories.employees.getAll();
    dispatch({ type: 'SET_EMPLOYEES', payload: employees });
  }, [dispatch]);

  const createEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEmployee = repositories.employees.create(employeeData);
      dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
      toast({
        title: 'Employé créé',
        description: `${newEmployee.firstName} ${newEmployee.lastName} a été ajouté avec succès.`,
        variant: 'default',
      });
      return newEmployee;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'employé.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    try {
      const updatedEmployee = repositories.employees.update(id, updates);
      if (updatedEmployee) {
        dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
        toast({
          title: 'Employé mis à jour',
          description: 'Les informations ont été sauvegardées.',
        });
        return updatedEmployee;
      }
      return null;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'employé.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteEmployee = (id: string) => {
    try {
      const success = repositories.employees.delete(id);
      if (success) {
        dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
        toast({
          title: 'Employé supprimé',
          description: 'L\'employé a été retiré du système.',
        });
      }
      return success;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'employé.',
        variant: 'destructive',
      });
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