import React from 'react'
import { Search, Plus, Edit, Trash2, HardHat, Shield, Eye, Download, RefreshCw, AlertTriangle, CheckCircle, Users, BarChart3, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePersonnelManagement } from '@/hooks/usePersonnelManagement'
import { StatusBadge } from '@/components/ui/status-badge'
import { DGPersonnelView } from './dg/DGPersonnelView'
import { EmployeeForm } from '@/components/personnel/EmployeeForm'
import { DeleteConfirmation } from '@/components/personnel/DeleteConfirmation'
import { EmployeeFilters } from '@/components/personnel/EmployeeFilters'

export function PersonnelPageOptimized() {
  const {
    state,
    employees,
    stats,
    permissions,
    availableServices,
    availableRoles,
    handleCreateEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    handleExportData,
    handleFiltersChange,
    handleResetFilters,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    selectEmployee,
    closeDialogs,
    setError,
    setSuccess
  } = usePersonnelManagement()

  // Redirection vers vue DG si utilisateur est DG
  if (permissions.isDG) {
    return <DGPersonnelView />
  }

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
          {permissions.canCreateEmployee && (
            <Button 
              className="gap-2 gradient-primary"
              onClick={openCreateDialog}
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
              {stats.activePercentage}% du total
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
              {stats.inactivePercentage}% du total
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
              <CardTitle>Liste des employés ({employees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {employees.map((employee) => (
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
                        onClick={() => selectEmployee(employee)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {permissions.canManagePersonnel && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(employee)}
                          disabled={state.loading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {permissions.canDeleteEmployee && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDeleteDialog(employee)}
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
        onClose={closeDialogs}
        onSubmit={handleCreateEmployee}
        loading={state.loading}
      />

      <EmployeeForm
        employee={state.selectedEmployee}
        isOpen={state.showEditDialog}
        onClose={closeDialogs}
        onSubmit={handleEditEmployee}
        loading={state.loading}
      />

      <DeleteConfirmation
        employee={state.selectedEmployee}
        isOpen={state.showDeleteDialog}
        onClose={closeDialogs}
        onConfirm={handleDeleteEmployee}
        loading={state.loading}
      />
    </div>
  )
}
