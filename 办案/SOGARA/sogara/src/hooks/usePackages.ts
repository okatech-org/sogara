import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { packagesAPI } from '@/services/api.service'
import { useToast } from '@/hooks/use-toast'

export const usePackages = (filters?: {
  status?: string
  recipientId?: string
  startDate?: string
  endDate?: string
}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch des colis
  const { data: packages = [], isLoading, error } = useQuery({
    queryKey: ['packages', filters],
    queryFn: () => packagesAPI.getAll(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: []
  })

  // Mutation pour créer un colis
  const createMutation = useMutation({
    mutationFn: (packageData: any) => packagesAPI.create(packageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast({
        title: 'Colis enregistré',
        description: 'Le colis a été enregistré avec succès'
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

  // Mutation pour mettre à jour un colis
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => packagesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast({
        title: 'Colis mis à jour',
        description: 'Le colis a été mis à jour avec succès'
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

  // Mutation pour récupérer un colis
  const pickupMutation = useMutation({
    mutationFn: ({ id, pickedUpBy }: { id: string; pickedUpBy?: string }) => 
      packagesAPI.pickup(id, pickedUpBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast({
        title: 'Colis récupéré',
        description: 'Le colis a été marqué comme récupéré'
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

  // Mutation pour livrer un colis
  const deliverMutation = useMutation({
    mutationFn: ({ id, deliveredBy, notes }: { id: string; deliveredBy?: string; notes?: string }) => 
      packagesAPI.deliver(id, deliveredBy, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast({
        title: 'Colis livré',
        description: 'Le colis a été livré avec succès'
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

  // Mutation pour annuler un colis
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      packagesAPI.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast({
        title: 'Colis annulé',
        description: 'Le colis a été annulé avec succès'
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
    packages,
    isLoading,
    error,
    addPackage: createMutation.mutate,
    isCreating: createMutation.isPending,
    updatePackage: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    pickupPackage: pickupMutation.mutate,
    isPickingUp: pickupMutation.isPending,
    deliverPackage: deliverMutation.mutate,
    isDelivering: deliverMutation.isPending,
    cancelPackage: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending
  }
}

export const usePendingPackages = () => {
  const { data: packages = [], isLoading, error } = useQuery({
    queryKey: ['packages', 'pending'],
    queryFn: () => packagesAPI.getPending().then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    placeholderData: []
  })

  return { packages, isLoading, error }
}

export const usePackagesByRecipient = (employeeId: string) => {
  const { data: packages = [], isLoading, error } = useQuery({
    queryKey: ['packages', 'by-recipient', employeeId],
    queryFn: () => packagesAPI.getByRecipient(employeeId).then(res => res.data),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    placeholderData: []
  })

  return { packages, isLoading, error }
}

export const usePackageStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['packages', 'stats'],
    queryFn: () => packagesAPI.getStats().then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: {
      totalPackages: 0,
      pendingPackages: 0,
      byStatus: []
    }
  })

  return { stats, isLoading, error }
}
