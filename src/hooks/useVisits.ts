import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { visitsAPI } from '@/services/api.service'
import { useToast } from '@/hooks/use-toast'

export const useVisits = (filters?: {
  status?: string
  hostEmployeeId?: string
  startDate?: string
  endDate?: string
}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch des visites
  const { data: visits = [], isLoading, error } = useQuery({
    queryKey: ['visits', filters],
    queryFn: () => visitsAPI.getAll(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: []
  })

  // Mutation pour créer une visite
  const createMutation = useMutation({
    mutationFn: (visitData: any) => visitsAPI.create(visitData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      toast({
        title: 'Visite créée',
        description: 'La visite a été créée avec succès'
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

  // Mutation pour mettre à jour une visite
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => visitsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      toast({
        title: 'Visite mise à jour',
        description: 'La visite a été mise à jour avec succès'
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

  // Mutation pour check-in
  const checkinMutation = useMutation({
    mutationFn: ({ id, badgeNumber }: { id: string; badgeNumber?: string }) => 
      visitsAPI.checkin(id, badgeNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      toast({
        title: 'Check-in effectué',
        description: 'Le visiteur a été enregistré'
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

  // Mutation pour check-out
  const checkoutMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => 
      visitsAPI.checkout(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      toast({
        title: 'Check-out effectué',
        description: 'Le visiteur a été enregistré comme parti'
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

  // Mutation pour annuler une visite
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      visitsAPI.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      toast({
        title: 'Visite annulée',
        description: 'La visite a été annulée avec succès'
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
    visits,
    isLoading,
    error,
    addVisit: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateVisit: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    checkinVisit: checkinMutation.mutate,
    isCheckingIn: checkinMutation.isPending,
    checkoutVisit: checkoutMutation.mutate,
    isCheckingOut: checkoutMutation.isPending,
    cancelVisit: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending
  }
}

export const useTodaysVisits = () => {
  const { data: visits = [], isLoading, error } = useQuery({
    queryKey: ['visits', 'today'],
    queryFn: () => visitsAPI.getTodaysVisits().then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    placeholderData: []
  })

  return { visits, isLoading, error }
}

export const useVisitsByDate = (date: string) => {
  const { data: visits = [], isLoading, error } = useQuery({
    queryKey: ['visits', 'by-date', date],
    queryFn: () => visitsAPI.getByDate(date).then(res => res.data),
    enabled: !!date,
    staleTime: 5 * 60 * 1000,
    placeholderData: []
  })

  return { visits, isLoading, error }
}

export const useVisitStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['visits', 'stats'],
    queryFn: () => visitsAPI.getStats().then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: {
      totalVisits: 0,
      todayVisits: 0,
      byStatus: []
    }
  })

  return { stats, isLoading, error }
}