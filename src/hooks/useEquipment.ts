import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { Equipment, EquipmentStatus } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useEquipment() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const equipment = repositories.equipment.getAll();
    dispatch({ type: 'SET_EQUIPMENT', payload: equipment });
  }, [dispatch]);

  const createEquipment = (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEquipment = repositories.equipment.create(equipmentData);
      dispatch({ type: 'ADD_EQUIPMENT', payload: newEquipment });
      
      toast({
        title: 'Équipement créé',
        description: `${newEquipment.label} a été ajouté au catalogue.`,
      });
      return newEquipment;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'équipement.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    try {
      const updatedEquipment = repositories.equipment.update(id, updates);
      if (updatedEquipment) {
        dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });
        toast({
          title: 'Équipement mis à jour',
          description: 'Les modifications ont été sauvegardées.',
        });
        return updatedEquipment;
      }
      return null;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'équipement.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const assignEquipment = (equipmentId: string, employeeId: string) => {
    try {
      const updatedEquipment = repositories.equipment.update(equipmentId, {
        holderEmployeeId: employeeId,
        status: 'operational' as EquipmentStatus,
      });
      
      if (updatedEquipment) {
        dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });
        toast({
          title: 'Équipement affecté',
          description: 'L\'affectation a été enregistrée.',
        });
        return updatedEquipment;
      }
      return null;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'affecter l\'équipement.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const unassignEquipment = (equipmentId: string) => {
    try {
      const updatedEquipment = repositories.equipment.update(equipmentId, {
        holderEmployeeId: undefined,
      });
      
      if (updatedEquipment) {
        dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });
        toast({
          title: 'Équipement libéré',
          description: 'L\'équipement est maintenant disponible.',
        });
        return updatedEquipment;
      }
      return null;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de libérer l\'équipement.',
        variant: 'destructive',
      });
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