import React, { useState, useMemo, useCallback } from 'react'
import { Search, Plus, Filter, Edit, Trash2, HardHat, Shield, Eye, Download, RefreshCw, AlertTriangle, CheckCircle, Users, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEmployees } from '@/hooks/useEmployees'
import { useAuth } from '@/contexts/AppContext'
import { Employee } from '@/types'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/hooks/use-toast'
import { DGPersonnelView } from './dg/DGPersonnelView'
import { EmployeeForm } from '@/components/personnel/EmployeeForm'
import { DeleteConfirmation } from '@/components/personnel/DeleteConfirmation'
import { EmployeeFilters } from '@/components/personnel/EmployeeFilters'

interface FilterState {
  search: string
  service: string
  status: string
  role: string
}

interface PersonnelPageState {
  loading: boolean
  error: string | null
  success: string | null
  showCreateDialog: boolean
  showEditDialog: boolean
  showDeleteDialog: boolean
  selectedEmployee: Employee | null
  filters: FilterState
  selectedEmployees: string[]
}

const initialState: PersonnelPageState = {
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
  },
  selectedEmployees: []
}

export function PersonnelPageComplete() {
  const { employees, createEmployee, updateEmployee, deleteEmployee } = useEmployees()
  const { hasAnyRole, hasRole } = useAuth()
  const { toast } = useToast()
  
  const [state, setState] = useState<PersonnelPageState>(initialState)

  // Redirection vers vue DG si utilisateur est DG
  if (hasRole('DG')) {
    return <DGPersonnelView />
  }

  const canManagePersonnel = hasAnyRole(['ADMIN', 'SUPERVISEUR'])
  const canCreateEmployee = hasAnyRole(['ADMIN', 'DRH'])
  const canDeleteEmployee = hasAnyRole(['ADMIN'])
  const canEditRoles = hasAnyRole(['ADMIN'])

  // Services et rôles uniques pour les filtres
  const availableServices = useMemo(() => {
    return [...new Set(employees.map(e => e.service))].sort()
  }, [employees])

  const availableRoles = useMemo(() => {
    return [...new Set(employees.flatMap(e => e.roles))].sort()
  }, [employees])

  // Filtrage des employés
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

  // Statistiques
  const stats = useMemo(() => {
    const total = employees.length
    const active = employees.filter(e => e.status === 'active').length
    const inactive = employees.filter(e => e.status === 'inactive').length
    
    return {
      total,
      active,
      inactive,
      services: availableServices.length,
      filtered: filteredEmployees.length
    }
  }, [employees, availableServices.length, filteredEmployees.length])

  // Gestionnaires d'état
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

  // Handlers pour les actions
  const handleCreateEmployee = async (formData: any) => {
    if (!canCreateEmployee) {
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
  }

  const handleEditEmployee = async (formData: any) => {
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
  }

  const handleDeleteEmployee = async () => {
    if (!state.selectedEmployee || !canDeleteEmployee) {
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
  }

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

  const roleColors = {
    ADMIN: 'destructive',
    HSE: 'secondary',
    SUPERVISEUR: 'default',
    RECEP: 'secondary',
    EMPLOYE: 'outline',
    DG: 'default',
    DRH: 'default'
  } as const

  return (
    <div className="space-y-6">
      {/* Messages d'état */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{state.error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {state.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">{state.success}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSuccess(null)}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* En-tête avec statistiques */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personnel</h1>
          <p className="text-muted-foreground">Gestion des employés et de leurs habilitations</p>
        </div>
        <div className="flex items-center gap-3">
          {canCreateEmployee && (
            <Button 
              className="gap-2 gradient-primary"
              onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}
              disabled={state.loading}
            >
              {state.loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Nouvel employé
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleExportData}
            disabled={state.loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.filtered} affichés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.services}</div>
            <p className="text-xs text-muted-foreground">
              Services actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <EmployeeFilters
        filters={state.filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        availableServices={availableServices}
        availableRoles={availableRoles}
        loading={state.loading}
      />

      {/* Liste des employés */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Liste des employés ({filteredEmployees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.matricule} • {employee.service}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {employee.roles[0]}
                          </Badge>
                          <StatusBadge status={employee.status} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setState(prev => ({ 
                          ...prev, 
                          selectedEmployee: employee 
                        }))}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canManagePersonnel && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setState(prev => ({ 
                            ...prev, 
                            selectedEmployee: employee,
                            showEditDialog: true 
                          }))}
                          disabled={state.loading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDeleteEmployee && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setState(prev => ({ 
                            ...prev, 
                            selectedEmployee: employee,
                            showDeleteDialog: true 
                          }))}
                          disabled={state.loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détails de l'employé sélectionné */}
        <div>
          {state.selectedEmployee ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Détails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">
                    {state.selectedEmployee.firstName} {state.selectedEmployee.lastName}
                  </h3>
                  <p className="text-muted-foreground">{state.selectedEmployee.matricule}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Informations</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Service :</strong> {state.selectedEmployee.service}</p>
                    <p><strong>Email :</strong> {state.selectedEmployee.email || 'Non renseigné'}</p>
                    <p><strong>Téléphone :</strong> {state.selectedEmployee.phone || 'Non renseigné'}</p>
                    <p><strong>Statut :</strong> 
                      <StatusBadge status={state.selectedEmployee.status} className="ml-2" />
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Rôles</h4>
                  <div className="flex flex-wrap gap-1">
                    {state.selectedEmployee.roles.map(role => (
                      <Badge key={role} variant={roleColors[role as keyof typeof roleColors]}>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                {state.selectedEmployee.competences && state.selectedEmployee.competences.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Compétences</h4>
                    <div className="flex flex-wrap gap-1">
                      {state.selectedEmployee.competences.map(comp => (
                        <Badge key={comp} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {state.selectedEmployee.habilitations && state.selectedEmployee.habilitations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Habilitations</h4>
                    <div className="flex flex-wrap gap-1">
                      {state.selectedEmployee.habilitations.map(hab => (
                        <div key={hab} className="flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-1 rounded">
                          <Shield className="w-3 h-3" />
                          {hab}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Équipements</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardHat className="w-4 h-4" />
                    {state.selectedEmployee.equipmentIds?.length || 0} équipements
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Sélectionnez un employé pour voir ses détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modales */}
      <EmployeeForm
        employee={null}
        isOpen={state.showCreateDialog}
        onClose={() => setState(prev => ({ ...prev, showCreateDialog: false }))}
        onSubmit={handleCreateEmployee}
        loading={state.loading}
      />

      <EmployeeForm
        employee={state.selectedEmployee}
        isOpen={state.showEditDialog}
        onClose={() => setState(prev => ({ ...prev, showEditDialog: false }))}
        onSubmit={handleEditEmployee}
        loading={state.loading}
      />

      <DeleteConfirmation
        employee={state.selectedEmployee}
        isOpen={state.showDeleteDialog}
        onClose={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}
        onConfirm={handleDeleteEmployee}
        loading={state.loading}
      />
    </div>
  )
}
