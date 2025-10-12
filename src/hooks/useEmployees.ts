import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Employee, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Id } from "../../convex/_generated/dataModel";
import { repositories } from '@/services/repositories';

export function useEmployees() {
  // Utiliser useQuery pour récupérer la liste des employés en temps réel
  const employeesData = useQuery(api.employees.list);

  // Fallback local si Convex n'est pas disponible
  const [fallbackEmployees, setFallbackEmployees] = useState<Employee[] | null>(null);
  const [fallbackReady, setFallbackReady] = useState(false);

  useEffect(() => {
    if (employeesData === undefined && !fallbackReady) {
      const list = repositories.employees.getAll();
      setFallbackEmployees(list);
      setFallbackReady(true);
    }
  }, [employeesData, fallbackReady]);

  // Mutations Convex
  const createMutation = useMutation(api.employees.create);
  const updateMutation = useMutation(api.employees.update);
  const removeMutation = useMutation(api.employees.remove);

  // Mapper les données (Convex si dispo, sinon fallback local)
  const employees: Employee[] = useMemo(() => {
    if (employeesData) {
      return (employeesData as any[]).map((e: any) => ({
        id: e._id,
        firstName: e.firstName,
        lastName: e.lastName,
        matricule: e.matricule,
        service: e.service,
        roles: e.roles || [],
        competences: e.competences || [],
        habilitations: e.habilitations || [],
        email: e.email,
        phone: e.phone,
        status: e.status,
        stats: e.stats,
        equipmentIds: e.equipmentIds || [],
        createdAt: new Date(e._creationTime),
        updatedAt: new Date(e._creationTime),
      }));
    }
    return fallbackEmployees || [];
  }, [employeesData, fallbackEmployees]);

  const createEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createMutation({
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        matricule: employeeData.matricule,
        service: employeeData.service,
        roles: employeeData.roles,
        competences: employeeData.competences || [],
        habilitations: employeeData.habilitations || [],
        email: employeeData.email,
        phone: employeeData.phone,
        status: employeeData.status || "active",
      });

      toast({
        title: 'Employé créé',
        description: `${employeeData.firstName} ${employeeData.lastName} a été ajouté avec succès.`,
      });

      return { success: true };
    } catch (error: any) {
      try {
        const created = repositories.employees.create(employeeData as any);
        setFallbackEmployees((prev) => prev ? [created, ...prev] : [created]);
        toast({ title: 'Employé créé (local)', description: 'Ajout enregistré localement.' });
        return { success: true, offline: true } as any;
      } catch (e: any) {
        toast({ title: 'Erreur', description: e?.message || 'Impossible de créer l\'employé.', variant: 'destructive' });
        return { success: false, error: e?.message };
      }
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      await updateMutation({
        id: id as Id<"employees">,
        firstName: updates.firstName,
        lastName: updates.lastName,
        service: updates.service,
        roles: updates.roles,
        competences: updates.competences,
        habilitations: updates.habilitations,
        email: updates.email,
        phone: updates.phone,
        status: updates.status,
      });

      toast({
        title: 'Employé mis à jour',
        description: 'Les informations ont été sauvegardées.',
      });

      return { success: true };
    } catch (error: any) {
      try {
        const updated = repositories.employees.update(id, updates as any);
        if (updated) {
          setFallbackEmployees((prev) => prev ? prev.map(e => e.id === id ? updated : e) : [updated]);
          toast({ title: 'Employé mis à jour (local)', description: 'Modifications sauvegardées localement.' });
          return { success: true, offline: true } as any;
        }
        return { success: false };
      } catch (e: any) {
        toast({ title: 'Erreur', description: e?.message || 'Impossible de mettre à jour l\'employé.', variant: 'destructive' });
        return { success: false, error: e?.message };
      }
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await removeMutation({ id: id as Id<"employees"> });

      toast({
        title: 'Employé supprimé',
        description: 'L\'employé a été retiré du système.',
      });

      return { success: true };
    } catch (error: any) {
      const ok = repositories.employees.delete(id);
      if (ok) {
        setFallbackEmployees((prev) => prev ? prev.filter(e => e.id !== id) : []);
        toast({ title: 'Employé supprimé (local)', description: 'Suppression effectuée localement.' });
        return { success: true, offline: true } as any;
      }
      return { success: false, error: error?.message };
    }
  };

  const getEmployeesByRole = (role: UserRole) => {
    return employees.filter(emp => emp.roles.includes(role));
  };

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp.id === id);
  };

  return {
    employees,
    isLoading: employeesData === undefined && !fallbackReady,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByRole,
    getEmployeeById,
  };
}