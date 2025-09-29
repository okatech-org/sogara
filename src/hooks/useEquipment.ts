import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { Equipment, EquipmentStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { convex, convexClientAvailable } from '@/lib/convexClient';

export function useEquipment() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        if (convexClientAvailable) {
          const res = await convex.query('equipment:list', {});
          if (!cancelled && Array.isArray(res)) {
            const mapped = res.map((e: any) => ({
              id: String(e._id ?? e.id),
              type: e.type,
              label: e.label,
              serialNumber: e.serialNumber,
              holderEmployeeId: e.holderEmployeeId ? String(e.holderEmployeeId) : undefined,
              status: e.status as EquipmentStatus,
              nextCheckDate: e.nextCheckDate ? new Date(e.nextCheckDate) : undefined,
              description: e.description,
              location: e.location,
              history: e.history ?? [],
              createdAt: new Date(e.createdAt ?? Date.now()),
              updatedAt: new Date(e.updatedAt ?? Date.now()),
            })) as Equipment[];
            dispatch({ type: 'SET_EQUIPMENT', payload: mapped });
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }
        }
      } catch (_) {
        if (!cancelled) {
          toast({ title: 'Erreur', description: 'Impossible de charger les équipements.', variant: 'destructive' });
        }
      }
      const local = repositories.equipment.getAll();
      if (!cancelled) {
        dispatch({ type: 'SET_EQUIPMENT', payload: local });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const createEquipment = async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (convexClientAvailable) {
        const created = await convex.mutation('equipment:create', equipmentData);
        if (created) {
          const mapped: Equipment = {
            id: String(created._id ?? created.id),
            type: created.type,
            label: created.label,
            serialNumber: created.serialNumber,
            holderEmployeeId: created.holderEmployeeId ? String(created.holderEmployeeId) : undefined,
            status: created.status as EquipmentStatus,
            nextCheckDate: created.nextCheckDate ? new Date(created.nextCheckDate) : undefined,
            description: created.description,
            location: created.location,
            history: created.history ?? [],
            createdAt: new Date(created.createdAt ?? Date.now()),
            updatedAt: new Date(created.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'ADD_EQUIPMENT', payload: mapped });
          toast({ title: 'Équipement créé', description: `${mapped.label} a été ajouté au catalogue.` });
          return mapped;
        }
      }
      const newEquipment = repositories.equipment.create(equipmentData);
      dispatch({ type: 'ADD_EQUIPMENT', payload: newEquipment });
      toast({ title: 'Équipement créé', description: `${newEquipment.label} a été ajouté au catalogue.` });
      return newEquipment;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer l\'équipement.', variant: 'destructive' });
      throw error;
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      if (convexClientAvailable) {
        const updated = await convex.mutation('equipment:update', { id, updates });
        if (updated) {
          const mapped: Equipment = {
            id: String(updated._id ?? updated.id),
            type: updated.type,
            label: updated.label,
            serialNumber: updated.serialNumber,
            holderEmployeeId: updated.holderEmployeeId ? String(updated.holderEmployeeId) : undefined,
            status: updated.status as EquipmentStatus,
            nextCheckDate: updated.nextCheckDate ? new Date(updated.nextCheckDate) : undefined,
            description: updated.description,
            location: updated.location,
            history: updated.history ?? [],
            createdAt: new Date(updated.createdAt ?? Date.now()),
            updatedAt: new Date(updated.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'UPDATE_EQUIPMENT', payload: mapped });
          toast({ title: 'Équipement mis à jour', description: 'Les modifications ont été sauvegardées.' });
          return mapped;
        }
      }
      const updatedEquipment = repositories.equipment.update(id, updates);
      if (updatedEquipment) {
        dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });
        toast({ title: 'Équipement mis à jour', description: 'Les modifications ont été sauvegardées.' });
      }
      return updatedEquipment;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour l\'équipement.', variant: 'destructive' });
      throw error;
    }
  };

  const assignEquipment = async (equipmentId: string, employeeId: string) => {
    try {
      if (convexClientAvailable) {
        const updated = await convex.mutation('equipment:assign', { id: equipmentId, employeeId });
        if (updated) {
          const mapped: Equipment = {
            id: String(updated._id ?? updated.id),
            type: updated.type,
            label: updated.label,
            serialNumber: updated.serialNumber,
            holderEmployeeId: updated.holderEmployeeId ? String(updated.holderEmployeeId) : undefined,
            status: updated.status as EquipmentStatus,
            nextCheckDate: updated.nextCheckDate ? new Date(updated.nextCheckDate) : undefined,
            description: updated.description,
            location: updated.location,
            history: updated.history ?? [],
            createdAt: new Date(updated.createdAt ?? Date.now()),
            updatedAt: new Date(updated.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'UPDATE_EQUIPMENT', payload: mapped });
          toast({ title: 'Équipement affecté', description: "L'affectation a été enregistrée." });
          return mapped;
        }
      }
      const updatedEquipment = repositories.equipment.update(equipmentId, {
        holderEmployeeId: employeeId,
        status: 'operational' as EquipmentStatus,
      });
      if (updatedEquipment) {
        dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });
        toast({ title: 'Équipement affecté', description: "L'affectation a été enregistrée." });
      }
      return updatedEquipment;
    } catch (error) {
      toast({ title: 'Erreur', description: "Impossible d'affecter l'équipement.", variant: 'destructive' });
      throw error;
    }
  };

  const unassignEquipment = async (equipmentId: string) => {
    try {
      if (convexClientAvailable) {
        const updated = await convex.mutation('equipment:unassign', { id: equipmentId });
        if (updated) {
          const mapped: Equipment = {
            id: String(updated._id ?? updated.id),
            type: updated.type,
            label: updated.label,
            serialNumber: updated.serialNumber,
            holderEmployeeId: updated.holderEmployeeId ? String(updated.holderEmployeeId) : undefined,
            status: updated.status as EquipmentStatus,
            nextCheckDate: updated.nextCheckDate ? new Date(updated.nextCheckDate) : undefined,
            description: updated.description,
            location: updated.location,
            history: updated.history ?? [],
            createdAt: new Date(updated.createdAt ?? Date.now()),
            updatedAt: new Date(updated.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'UPDATE_EQUIPMENT', payload: mapped });
          toast({ title: 'Équipement libéré', description: "L'équipement est maintenant disponible." });
          return mapped;
        }
      }
      const updatedEquipment = repositories.equipment.update(equipmentId, { holderEmployeeId: undefined });
      if (updatedEquipment) {
        dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });
        toast({ title: 'Équipement libéré', description: "L'équipement est maintenant disponible." });
      }
      return updatedEquipment;
    } catch (error) {
      toast({ title: 'Erreur', description: "Impossible de libérer l'équipement.", variant: 'destructive' });
      throw error;
    }
  };

  const getEquipmentByEmployee = (employeeId: string) => {
    return state.equipment.filter(eq => eq.holderEmployeeId === employeeId);
  };

  const getAvailableEquipment = () => {
    return state.equipment.filter(eq => 
      !eq.holderEmployeeId && eq.status === 'operational'
    );
  };

  const getEquipmentNeedingMaintenance = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return state.equipment.filter(eq => 
      eq.nextCheckDate && eq.nextCheckDate <= nextWeek
    );
  };

  const getEquipmentById = (id: string) => {
    return state.equipment.find(eq => eq.id === id);
  };

  return {
    equipment: state.equipment,
    createEquipment,
    updateEquipment,
    assignEquipment,
    unassignEquipment,
    getEquipmentByEmployee,
    getAvailableEquipment,
    getEquipmentNeedingMaintenance,
    getEquipmentById,
  };
}