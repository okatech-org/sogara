import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hseAPI } from '@/services/api.service'
import { useToast } from '@/hooks/use-toast'

// ===== HOOKS POUR LES INCIDENTS =====
export const useIncidents = (filters?: {
  status?: string
  severity?: string
  startDate?: string
  endDate?: string
}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: incidents = [], isLoading, error } = useQuery({
    queryKey: ['hse', 'incidents', filters],
    queryFn: () => hseAPI.getIncidents(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: []
  })

  const createMutation = useMutation({
    mutationFn: (incidentData: any) => hseAPI.createIncident(incidentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'incidents'] })
      toast({
        title: 'Incident créé',
        description: 'L\'incident a été créé avec succès'
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hseAPI.updateIncident(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'incidents'] })
      toast({
        title: 'Incident mis à jour',
        description: 'L\'incident a été mis à jour avec succès'
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

  const closeMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => hseAPI.closeIncident(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'incidents'] })
      toast({
        title: 'Incident fermé',
        description: 'L\'incident a été fermé avec succès'
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
    incidents,
    isLoading,
    error,
    createIncident: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateIncident: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    closeIncident: closeMutation.mutate,
    isClosing: closeMutation.isPending
  }
}

// ===== HOOKS POUR LES FORMATIONS =====
export const useTrainings = (filters?: {
  status?: string
  type?: string
  startDate?: string
  endDate?: string
}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: trainings = [], isLoading, error } = useQuery({
    queryKey: ['hse', 'trainings', filters],
    queryFn: () => hseAPI.getTrainings(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: []
  })

  const createMutation = useMutation({
    mutationFn: (trainingData: any) => hseAPI.createTraining(trainingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'trainings'] })
      toast({
        title: 'Formation créée',
        description: 'La formation a été créée avec succès'
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hseAPI.updateTraining(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'trainings'] })
      toast({
        title: 'Formation mise à jour',
        description: 'La formation a été mise à jour avec succès'
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

  const validateMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => hseAPI.validateTraining(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'trainings'] })
      toast({
        title: 'Formation validée',
        description: 'La formation a été validée avec succès'
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

  const enrollMutation = useMutation({
    mutationFn: ({ id, employeeData }: { id: string; employeeData: any }) => 
      hseAPI.enrollEmployee(id, employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'trainings'] })
      toast({
        title: 'Employé inscrit',
        description: 'L\'employé a été inscrit à la formation'
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
    trainings,
    isLoading,
    error,
    createTraining: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateTraining: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    validateTraining: validateMutation.mutate,
    isValidating: validateMutation.isPending,
    enrollEmployee: enrollMutation.mutate,
    isEnrolling: enrollMutation.isPending
  }
}

// ===== HOOKS POUR LA CONFORMITÉ =====
export const useCompliance = (filters?: {
  status?: string
  category?: string
}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: compliance = [], isLoading, error } = useQuery({
    queryKey: ['hse', 'compliance', filters],
    queryFn: () => hseAPI.getCompliance(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: []
  })

  const createMutation = useMutation({
    mutationFn: (complianceData: any) => hseAPI.createCompliance(complianceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'compliance'] })
      toast({
        title: 'Élément de conformité créé',
        description: 'L\'élément de conformité a été créé avec succès'
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hseAPI.updateCompliance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'compliance'] })
      toast({
        title: 'Élément de conformité mis à jour',
        description: 'L\'élément de conformité a été mis à jour avec succès'
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

  const validateMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => hseAPI.validateCompliance(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse', 'compliance'] })
      toast({
        title: 'Élément de conformité validé',
        description: 'L\'élément de conformité a été validé avec succès'
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
    compliance,
    isLoading,
    error,
    createCompliance: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateCompliance: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    validateCompliance: validateMutation.mutate,
    isValidating: validateMutation.isPending
  }
}

// ===== HOOKS POUR LES STATISTIQUES =====
export const useHSEStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['hse', 'stats', 'overview'],
    queryFn: () => hseAPI.getStats().then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: {
      incidents: [],
      trainings: [],
      compliance: []
    }
  })

  return { stats, isLoading, error }
}

export const useIncidentStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['hse', 'stats', 'incidents'],
    queryFn: () => hseAPI.getIncidentStats().then(res => res.data),
    staleTime: 10 * 60 * 1000,
    placeholderData: []
  })

  return { stats, isLoading, error }
}

export const useTrainingStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['hse', 'stats', 'trainings'],
    queryFn: () => hseAPI.getTrainingStats().then(res => res.data),
    staleTime: 10 * 60 * 1000,
    placeholderData: []
  })

  return { stats, isLoading, error }
}

export const useComplianceStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['hse', 'stats', 'compliance'],
    queryFn: () => hseAPI.getComplianceStats().then(res => res.data),
    staleTime: 10 * 60 * 1000,
    placeholderData: []
  })

  return { stats, isLoading, error }
}