import { useState, useCallback, useMemo } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import { useAuth } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'
import { Employee } from '@/types'

interface FilterState {
  search: string
  service: string
  status: string
  role: string
}

interface PersonnelState {
  loading: boolean
  error: string | null
  success: string | null
  showCreateDialog: boolean
  showEditDialog: boolean
  showDeleteDialog: boolean
  selectedEmployee: Employee | null
  filters: FilterState
}

const initialState: PersonnelState = {
  loading: false,
  error: null,
  success: null,
  showCreateDialog: false,
  showEditDialog: false,
  showDeleteDialog: false,
  selectedEmployee: null,
  filters: {
    search: '',
    service: 'all',
    status: 'all',
    role: 'all'
  }
}

export function usePersonnelManagement() {
  const { employees, createEmployee, updateEmployee, deleteEmployee } = useEmployees()
  const { hasAnyRole, hasRole } = useAuth()
  const { toast } = useToast()
  
  const [state, setState] = useState<PersonnelState>(initialState)

  // Permissions
  const permissions = useMemo(() => ({
    canManagePersonnel: hasAnyRole(['ADMIN', 'SUPERVISEUR']),
    canCreateEmployee: hasAnyRole(['ADMIN', 'DRH']),
    canDeleteEmployee: hasAnyRole(['ADMIN']),
    canEditRoles: hasAnyRole(['ADMIN']),
    isDG: hasRole('DG')
  }), [hasAnyRole, hasRole])

  // Services et rôles uniques pour les filtres
  const availableServices = useMemo(() => {
    return [...new Set(employees.map(e => e.service))].sort()
  }, [employees])

  const availableRoles = useMemo(() => {
    return [...new Set(employees.flatMap(e => e.roles))].sort()
  }, [employees])

  // Filtrage des employés avec mémorisation
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = 
        employee.firstName.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        employee.matricule.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        employee.email?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        employee.phone?.toLowerCase().includes(state.filters.search.toLowerCase())
      
      const matchesService = state.filters.service === 'all' || employee.service === state.filters.service
      const matchesStatus = state.filters.status === 'all' || employee.status === state.filters.status
      const matchesRole = state.filters.role === 'all' || employee.roles.includes(state.filters.role)
      
      return matchesSearch && matchesService && matchesStatus && matchesRole
    })
  }, [employees, state.filters])

  // Statistiques avec mémorisation
  const stats = useMemo(() => {
    const total = employees.length
    const active = employees.filter(e => e.status === 'active').length
    const inactive = employees.filter(e => e.status === 'inactive').length
    
    return {
      total,
      active,
      inactive,
      services: availableServices.length,
      filtered: filteredEmployees.length,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
      inactivePercentage: total > 0 ? Math.round((inactive / total) * 100) : 0
    }
  }, [employees, availableServices.length, filteredEmployees.length])

  // Gestionnaires d'état optimisés
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setSuccess = useCallback((success: string | null) => {
    setState(prev => ({ ...prev, success }))
    if (success) {
      setTimeout(() => setSuccess(null), 3000)
    }
  }, [])

  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      loading: false,
      error: null,
      success: null,
      showCreateDialog: false,
      showEditDialog: false,
      showDeleteDialog: false,
      selectedEmployee: null
    }))
  }, [])

  // Actions CRUD avec gestion d'erreurs optimisée
  const handleCreateEmployee = useCallback(async (formData: any) => {
    if (!permissions.canCreateEmployee) {
      toast({
        title: "Accès restreint",
        description: "La création d'employés est réservée à la DRH",
        variant: "destructive",
        duration: 5000
      })
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      await createEmployee(formData)
      setSuccess("Employé créé avec succès")
      resetState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'employé'
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }, [permissions.canCreateEmployee, createEmployee, toast, setLoading, setError, setSuccess, resetState])

  const handleEditEmployee = useCallback(async (formData: any) => {
    if (!state.selectedEmployee) return

    setLoading(true)
    setError(null)
    
    try {
      await updateEmployee(state.selectedEmployee.id, formData)
      setSuccess("Employé modifié avec succès")
      resetState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de l\'employé'
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }, [state.selectedEmployee, updateEmployee, toast, setLoading, setError, setSuccess, resetState])

  const handleDeleteEmployee = useCallback(async () => {
    if (!state.selectedEmployee || !permissions.canDeleteEmployee) {
      toast({
        title: "Accès restreint",
        description: "La suppression d'employés est réservée aux administrateurs",
        variant: "destructive",
        duration: 5000
      })
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      await deleteEmployee(state.selectedEmployee.id)
      setSuccess(`${state.selectedEmployee.firstName} ${state.selectedEmployee.lastName} a été supprimé`)
      resetState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'employé'
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }, [state.selectedEmployee, permissions.canDeleteEmployee, deleteEmployee, toast, setLoading, setError, setSuccess, resetState])

  // Export optimisé
  const handleExportData = useCallback(() => {
    const csvData = [
      ['Matricule', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Service', 'Rôles', 'Statut', 'Compétences', 'Habilitations'],
      ...filteredEmployees.map(emp => [
        emp.matricule,
        emp.firstName,
        emp.lastName,
        emp.email || '',
        emp.phone || '',
        emp.service,
        emp.roles.join(', '),
        emp.status,
        emp.competences?.join(', ') || '',
        emp.habilitations?.join(', ') || ''
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personnel-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Export réussi",
      description: "Les données ont été exportées avec succès",
    })
  }, [filteredEmployees, toast])

  // Gestion des filtres
  const handleFiltersChange = useCallback((filters: FilterState) => {
    setState(prev => ({ ...prev, filters }))
  }, [])

  const handleResetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        search: '',
        service: 'all',
        status: 'all',
        role: 'all'
      }
    }))
  }, [])

  // Actions de dialogue
  const openCreateDialog = useCallback(() => {
    setState(prev => ({ ...prev, showCreateDialog: true }))
  }, [])

  const openEditDialog = useCallback((employee: Employee) => {
    setState(prev => ({ 
      ...prev, 
      selectedEmployee: employee,
      showEditDialog: true 
    }))
  }, [])

  const openDeleteDialog = useCallback((employee: Employee) => {
    setState(prev => ({ 
      ...prev, 
      selectedEmployee: employee,
      showDeleteDialog: true 
    }))
  }, [])

  const selectEmployee = useCallback((employee: Employee) => {
    setState(prev => ({ ...prev, selectedEmployee: employee }))
  }, [])

  const closeDialogs = useCallback(() => {
    setState(prev => ({
      ...prev,
      showCreateDialog: false,
      showEditDialog: false,
      showDeleteDialog: false
    }))
  }, [])

  return {
    // État
    state,
    employees: filteredEmployees,
    stats,
    permissions,
    availableServices,
    availableRoles,
    
    // Actions
    handleCreateEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    handleExportData,
    handleFiltersChange,
    handleResetFilters,
    
    // Actions de dialogue
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    selectEmployee,
    closeDialogs,
    
    // Gestionnaires d'état
    setLoading,
    setError,
    setSuccess,
    resetState
  }
}
