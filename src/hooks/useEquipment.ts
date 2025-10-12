import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Equipment, EquipmentStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Id } from "../../convex/_generated/dataModel";
import { repositories } from '@/services/repositories';

export function useEquipment() {
  // Queries Convex
  const equipmentData = useQuery(api.equipment.list);

  // Fallback local
  const [fallbackEquipment, setFallbackEquipment] = useState<Equipment[] | null>(null);
  const [fallbackReady, setFallbackReady] = useState(false);

  useEffect(() => {
    if (equipmentData === undefined && !fallbackReady) {
      const list = repositories.equipment.getAll();
      setFallbackEquipment(list);
      setFallbackReady(true);
    }
  }, [equipmentData, fallbackReady]);

  // Mutations Convex
  const createMutation = useMutation(api.equipment.create);
  const updateMutation = useMutation(api.equipment.update);
  const assignMutation = useMutation(api.equipment.assignToEmployee);
  const unassignMutation = useMutation(api.equipment.unassign);
  const removeMutation = useMutation(api.equipment.remove);

  // Mapper les données (Convex si dispo, sinon fallback)
  const equipment: Equipment[] = useMemo(() => {
    if (equipmentData) {
      return (equipmentData as any[]).map((e: any) => ({
        id: e._id,
        type: e.type,
        label: e.label,
        serialNumber: e.serialNumber,
        holderEmployeeId: e.holderEmployeeId,
        status: e.status,
        nextCheckDate: e.nextCheckDate ? new Date(e.nextCheckDate) : undefined,
        description: e.description,
        location: e.location,
        history: [],
        createdAt: new Date(e._creationTime),
        updatedAt: new Date(e._creationTime),
      }));
    }
    return fallbackEquipment || [];
  }, [equipmentData, fallbackEquipment]);

  const createEquipment = async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createMutation({
        type: equipmentData.type,
        label: equipmentData.label,
        serialNumber: equipmentData.serialNumber,
        holderEmployeeId: equipmentData.holderEmployeeId as Id<"employees"> | undefined,
        status: equipmentData.status,
        nextCheckDate: equipmentData.nextCheckDate?.getTime(),
        description: equipmentData.description,
        location: equipmentData.location,
      });

      toast({
        title: 'Équipement créé',
        description: `${equipmentData.label} a été ajouté au catalogue.`,
      });

      return { success: true };
    } catch (error: any) {
      try {
        const created = repositories.equipment.create(equipmentData as any);
        setFallbackEquipment((prev) => prev ? [created, ...prev] : [created]);
        toast({ title: 'Équipement créé (local)', description: 'Ajout enregistré localement.' });
        return { success: true, offline: true } as any;
      } catch (e: any) {
        toast({ title: 'Erreur', description: e?.message || 'Impossible de créer l\'équipement.', variant: 'destructive' });
        return { success: false, error: e?.message };
      }
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      await updateMutation({
        id: id as Id<"equipment">,
        holderEmployeeId: updates.holderEmployeeId as Id<"employees"> | undefined,
        status: updates.status,
        nextCheckDate: updates.nextCheckDate?.getTime(),
        location: updates.location,
        description: updates.description,
      });

      toast({
        title: 'Équipement mis à jour',
        description: 'Les modifications ont été sauvegardées.',
      });

      return { success: true };
    } catch (error: any) {
      try {
        const updated = repositories.equipment.update(id, updates as any);
        if (updated) {
          setFallbackEquipment((prev) => prev ? prev.map(e => e.id === id ? updated : e) : [updated]);
          toast({ title: 'Équipement mis à jour (local)', description: 'Modifications sauvegardées localement.' });
          return { success: true, offline: true } as any;
        }
        return { success: false };
      } catch (e: any) {
        toast({ title: 'Erreur', description: e?.message || 'Impossible de mettre à jour l\'équipement.', variant: 'destructive' });
        return { success: false, error: e?.message };
      }
    }
  };

  const assignEquipment = async (equipmentId: string, employeeId: string) => {
    try {
      await assignMutation({
        equipmentId: equipmentId as Id<"equipment">,
        employeeId: employeeId as Id<"employees">,
      });

      toast({
        title: 'Équipement affecté',
        description: "L'affectation a été enregistrée.",
      });

      return { success: true };
    } catch (error: any) {
      const updated = repositories.equipment.update(equipmentId, { holderEmployeeId: employeeId } as any);
      if (updated) {
        setFallbackEquipment((prev) => prev ? prev.map(e => e.id === equipmentId ? updated : e) : [updated]);
        toast({ title: 'Équipement affecté (local)', description: "Affectation enregistrée localement." });
        return { success: true, offline: true } as any;
      }
      return { success: false };
    }
  };

  const unassignEquipment = async (equipmentId: string) => {
    try {
      await unassignMutation({
        equipmentId: equipmentId as Id<"equipment">,
      });

      toast({
        title: 'Équipement libéré',
        description: "L'équipement est maintenant disponible.",
      });

      return { success: true };
    } catch (error: any) {
      const updated = repositories.equipment.update(equipmentId, { holderEmployeeId: undefined } as any);
      if (updated) {
        setFallbackEquipment((prev) => prev ? prev.map(e => e.id === equipmentId ? updated : e) : [updated]);
        toast({ title: 'Équipement libéré (local)', description: "L'équipement est maintenant disponible." });
        return { success: true, offline: true } as any;
      }
      return { success: false };
    }
  };

  const getEquipmentByEmployee = (employeeId: string) => {
    return equipment.filter(eq => eq.holderEmployeeId === employeeId);
  };

  const getAvailableEquipment = () => {
    return equipment.filter(eq => 
      !eq.holderEmployeeId && eq.status === 'operational'
    );
  };

  const getEquipmentNeedingMaintenance = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return equipment.filter(eq => 
      eq.nextCheckDate && eq.nextCheckDate <= nextWeek
    );
  };

  const getEquipmentById = (id: string) => {
    return equipment.find(eq => eq.id === id);
  };

  // Attribution automatique d'EPI par rôle (raffinerie)
  const ensureRoleEquipment = async () => {
    try {
      const employees = repositories.employees.getAll();
      const requiredByRole: Record<string, Array<{ type: string; label: string }>> = {
        EMPLOYE: [
          { type: 'EPI', label: 'Casque de sécurité' },
          { type: 'EPI', label: 'Chaussures de sécurité' },
          { type: 'EPI', label: 'Lunettes de protection' },
          { type: 'EPI', label: 'Gants de protection' },
        ],
        SUPERVISEUR: [
          { type: 'EPI', label: 'Casque de sécurité' },
          { type: 'EPI', label: 'Chaussures de sécurité' },
          { type: 'EPI', label: 'Gilet haute visibilité' },
          { type: 'EPI', label: 'Radio de communication' },
        ],
        HSE: [
          { type: 'EPI', label: 'Casque de sécurité' },
          { type: 'EPI', label: 'Chaussures de sécurité' },
          { type: 'EPI', label: 'Détecteur de gaz portable' },
          { type: 'EPI', label: 'Gilet haute visibilité' },
        ],
        RECEP: [
          { type: 'EPI', label: 'Gilet haute visibilité' },
        ],
        ADMIN: [
          { type: 'EPI', label: 'Badge accès' },
        ],
      };

      const list = repositories.equipment.getAll();
      const createIfMissing = (holderEmployeeId: string, item: { type: string; label: string }) => {
        const exists = list.some(eq => eq.holderEmployeeId === holderEmployeeId && eq.label === item.label);
        if (!exists) {
          const created = repositories.equipment.create({
            type: item.type,
            label: item.label,
            serialNumber: undefined,
            holderEmployeeId,
            status: 'operational' as EquipmentStatus,
            description: undefined,
            location: undefined,
            nextCheckDate: undefined,
          } as any);
          list.push(created);
        }
      };

      employees.forEach(emp => {
        emp.roles.forEach(role => {
          const required = requiredByRole[role];
          if (required) required.forEach(item => createIfMissing(emp.id, item));
        });
      });

      setFallbackEquipment([...list]);
      return true;
    } catch (_) {
      return false;
    }
  };

  return {
    equipment,
    isLoading: equipmentData === undefined && !fallbackReady,
    createEquipment,
    updateEquipment,
    assignEquipment,
    unassignEquipment,
    getEquipmentByEmployee,
    getAvailableEquipment,
    getEquipmentNeedingMaintenance,
    getEquipmentById,
    ensureRoleEquipment,
  };
}
