import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentAPI } from '@/services/api.service'
import { useToast } from '@/hooks/use-toast'

export const useEquipment = (filters?: {
  status?: string
  type?: string
  location?: string
}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch des équipements
  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => equipmentAPI.getAll(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: []
  })

  // Mutation pour créer un équipement
  const createMutation = useMutation({
    mutationFn: (equipmentData: any) => equipmentAPI.create(equipmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast({
        title: 'Équipement créé',
        description: 'L\'équipement a été créé avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour mettre à jour un équipement
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => equipmentAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast({
        title: 'Équipement mis à jour',
        description: 'L\'équipement a été mis à jour avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour démarrer la maintenance
  const startMaintenanceMutation = useMutation({
    mutationFn: ({ id, reason, assignedTo }: { id: string; reason: string; assignedTo?: string }) => 
      equipmentAPI.startMaintenance(id, reason, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast({
        title: 'Maintenance démarrée',
        description: 'La maintenance a été démarrée avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour terminer la maintenance
  const completeMaintenanceMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => 
      equipmentAPI.completeMaintenance(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast({
        title: 'Maintenance terminée',
        description: 'La maintenance a été terminée avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour marquer comme hors service
  const markOutOfServiceMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      equipmentAPI.markOutOfService(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast({
        title: 'Équipement marqué hors service',
        description: 'L\'équipement a été marqué comme hors service'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour supprimer un équipement
  const deleteMutation = useMutation({
    mutationFn: (id: string) => equipmentAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast({
        title: 'Équipement supprimé',
        description: 'L\'équipement a été supprimé avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  return {
    equipment,
    isLoading,
    error,
    addEquipment: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateEquipment: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    startMaintenance: startMaintenanceMutation.mutate,
    isStartingMaintenance: startMaintenanceMutation.isPending,
    completeMaintenance: completeMaintenanceMutation.mutate,
    isCompletingMaintenance: completeMaintenanceMutation.isPending,
    markOutOfService: markOutOfServiceMutation.mutate,
    isMarkingOutOfService: markOutOfServiceMutation.isPending,
    deleteEquipment: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  }
}

export const useMaintenanceEquipment = () => {
  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['equipment', 'maintenance'],
    queryFn: () => equipmentAPI.getMaintenance().then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    placeholderData: []
  })

  return { equipment, isLoading, error }
}

export const useEquipmentByType = (type: string) => {
  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['equipment', 'by-type', type],
    queryFn: () => equipmentAPI.getByType(type).then(res => res.data),
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
    placeholderData: []
  })

  return { equipment, isLoading, error }
}

export const useEquipmentStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['equipment', 'stats'],
    queryFn: () => equipmentAPI.getStats().then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: {
      totalEquipment: 0,
      maintenanceEquipment: 0,
      byStatus: []
    }
  })

  return { stats, isLoading, error }
}