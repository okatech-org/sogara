import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  BookOpen,
  AlertTriangle,
  Award,
  Clock,
  Bell,
  Search,
  Filter,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/AppContext'
import { useHSETrainings } from '@/hooks/useHSETrainings'
import { Employee, HSETrainingModule, UserRole } from '@/types'
import hseModulesData from '@/data/hse-training-modules.json'

interface HSEEmployeeManagerProps {
  employees: Employee[]
  onAssignTraining?: (employeeId: string, trainingId: string) => void
  onSendNotification?: (employeeId: string, type: string, message: string) => void
}

interface EmployeeTrainingStatus {
  employeeId: string
  requiredTrainings: string[]
  completedTrainings: string[]
  expiredTrainings: string[]
  upcomingTrainings: string[]
  complianceRate: number
}

interface TrainingAssignment {
  employeeId: string
  trainingId: string
  assignedAt: Date
  dueDate: Date
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
}

export function HSEEmployeeManager({
  employees,
  onAssignTraining,
  onSendNotification,
}: HSEEmployeeManagerProps) {
  const { hasAnyRole, user } = useAuth()
  const { trainings, getExpiredTrainings, getExpiringTrainings } = useHSETrainings()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedTrainingToAssign, setSelectedTrainingToAssign] = useState<string>('')

  const canManageHSE = hasAnyRole(['ADMIN', 'HSE'])
  const trainingModules = hseModulesData.hseTrainingModules as HSETrainingModule[]

  // Calculer les formations requises selon le poste/rôle
  const getRequiredTrainingsForEmployee = (employee: Employee): string[] => {
    const requiredTrainings: string[] = []

    trainingModules.forEach(module => {
      const hasRequiredRole = employee.roles.some(role => module.requiredForRoles.includes(role))

      if (hasRequiredRole) {
        requiredTrainings.push(module.id)
      }
    })

    // Formations spécifiques selon le service
    if (employee.service === 'Production') {
      requiredTrainings.push('HSE-015', 'HSE-006', 'HSE-004') // H2S, Chimiques, Espace confiné
    }

    if (employee.service === 'Maintenance') {
      requiredTrainings.push('HSE-005', 'HSE-007') // Travail en hauteur, Permis
    }

    return [...new Set(requiredTrainings)]
  }

  // Calculer le statut de formation pour chaque employé
  const employeesTrainingStatus = useMemo(() => {
    return employees.map(employee => {
      const requiredTrainings = getRequiredTrainingsForEmployee(employee)
      const expiredTrainings = getExpiredTrainings(employee.id)
      const expiringTrainings = getExpiringTrainings(employee.id, 30)

      // Simuler les formations complétées (dans une vraie app, cela viendrait de la DB)
      const completedTrainings = requiredTrainings.slice(
        0,
        Math.floor(Math.random() * requiredTrainings.length),
      )

      const complianceRate =
        requiredTrainings.length > 0
          ? Math.round((completedTrainings.length / requiredTrainings.length) * 100)
          : 100

      return {
        employeeId: employee.id,
        requiredTrainings,
        completedTrainings,
        expiredTrainings: expiredTrainings.map(t => t.trainingId),
        upcomingTrainings: expiringTrainings.map(t => t.trainingId),
        complianceRate,
      }
    })
  }, [employees, trainings])

  // Filtrer les employés
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch =
        searchTerm === '' ||
        `${employee.firstName} ${employee.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.service.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesService = selectedService === 'all' || employee.service === selectedService
      const matchesRole =
        selectedRole === 'all' || employee.roles.includes(selectedRole as UserRole)

      return matchesSearch && matchesService && matchesRole
    })
  }, [employees, searchTerm, selectedService, selectedRole])

  // Obtenir les services uniques
  const services = [...new Set(employees.map(e => e.service))]
  const roles: UserRole[] = ['EMPLOYE', 'SUPERVISEUR', 'HSE', 'ADMIN']

  const handleAssignTraining = (employeeId: string) => {
    setSelectedEmployee(employees.find(e => e.id === employeeId) || null)
    setShowAssignDialog(true)
  }

  const confirmAssignTraining = () => {
    if (selectedEmployee && selectedTrainingToAssign) {
      onAssignTraining?.(selectedEmployee.id, selectedTrainingToAssign)
      setShowAssignDialog(false)
      setSelectedTrainingToAssign('')
      setSelectedEmployee(null)
    }
  }

  const sendTrainingReminder = (employeeId: string, trainingTitle: string) => {
    const message = `Rappel : Votre formation "${trainingTitle}" arrive à expiration. Veuillez programmer votre session de recyclage.`
    onSendNotification?.(employeeId, 'training_reminder', message)
  }

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComplianceVariant = (rate: number): 'success' | 'warning' | 'urgent' => {
    if (rate >= 90) return 'success'
    if (rate >= 70) return 'warning'
    return 'urgent'
  }

  const renderEmployeeCard = (employee: Employee) => {
    const status = employeesTrainingStatus.find(s => s.employeeId === employee.id)
    if (!status) return null

    const hasExpiredTrainings = status.expiredTrainings.length > 0
    const hasUpcomingRenewals = status.upcomingTrainings.length > 0

    return (
      <Card key={employee.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {employee.matricule} • {employee.service}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {employee.roles.map(role => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getComplianceColor(status.complianceRate)}`}>
                {status.complianceRate}%
              </div>
              <p className="text-xs text-muted-foreground">Conformité</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Barre de progression */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Formations</span>
              <span>
                {status.completedTrainings.length}/{status.requiredTrainings.length}
              </span>
            </div>
            <Progress
              value={status.complianceRate}
              className={`h-2 ${status.complianceRate < 70 ? 'bg-red-100' : status.complianceRate < 90 ? 'bg-yellow-100' : 'bg-green-100'}`}
            />
          </div>

          {/* Alertes */}
          {(hasExpiredTrainings || hasUpcomingRenewals) && (
            <div className="space-y-2">
              {hasExpiredTrainings && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{status.expiredTrainings.length} formation(s) expirée(s)</span>
                </div>
              )}
              {hasUpcomingRenewals && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm bg-yellow-50 p-2 rounded">
                  <Clock className="w-4 h-4" />
                  <span>{status.upcomingTrainings.length} renouvellement(s) à venir</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {canManageHSE && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedEmployee(employee)}
                className="flex-1"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Détails
              </Button>
              <Button
                size="sm"
                onClick={() => handleAssignTraining(employee.id)}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Assigner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderEmployeeDetails = (employee: Employee) => {
    const status = employeesTrainingStatus.find(s => s.employeeId === employee.id)
    if (!status) return null

    const requiredModules = trainingModules.filter(m => status.requiredTrainings.includes(m.id))
    const completedModules = trainingModules.filter(m => status.completedTrainings.includes(m.id))
    const expiredModules = trainingModules.filter(m => status.expiredTrainings.includes(m.id))
    const upcomingModules = trainingModules.filter(m => status.upcomingTrainings.includes(m.id))

    return (
      <div className="space-y-6">
        {/* En-tête employé */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-muted-foreground">
              {employee.matricule} • {employee.service}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {employee.roles.map(role => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <StatusBadge
              status={`${status.complianceRate}% conforme`}
              variant={getComplianceVariant(status.complianceRate)}
            />
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Formations requises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.requiredTrainings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Complétées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {status.completedTrainings.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Expirées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {status.expiredTrainings.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">À renouveler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {status.upcomingTrainings.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formations par catégorie */}
        <Tabs defaultValue="required" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="required">Requises ({requiredModules.length})</TabsTrigger>
            <TabsTrigger value="completed">Complétées ({completedModules.length})</TabsTrigger>
            <TabsTrigger value="expired">Expirées ({expiredModules.length})</TabsTrigger>
            <TabsTrigger value="upcoming">À renouveler ({upcomingModules.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="required" className="space-y-3">
            {requiredModules.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune formation requise</p>
            ) : (
              requiredModules.map(module => (
                <Card key={module.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {module.code} • {module.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{module.duration}h</Badge>
                        {canManageHSE && (
                          <Button size="sm" onClick={() => handleAssignTraining(employee.id)}>
                            Programmer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedModules.map(module => (
              <Card key={module.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{module.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {module.code} • Valide jusqu'au...
                      </p>
                    </div>
                    <Badge variant="secondary">Complétée</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="expired" className="space-y-3">
            {expiredModules.map(module => (
              <Card key={module.id} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-600">{module.title}</h4>
                      <p className="text-sm text-muted-foreground">{module.code} • Expirée</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="destructive">Expirée</Badge>
                      {canManageHSE && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendTrainingReminder(employee.id, module.title)}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          Rappel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-3">
            {upcomingModules.map(module => (
              <Card key={module.id} className="border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-yellow-600">{module.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {module.code} • À renouveler dans...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Bientôt</Badge>
                      {canManageHSE && (
                        <Button size="sm" onClick={() => handleAssignTraining(employee.id)}>
                          Renouveler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (!canManageHSE) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
        <p className="text-muted-foreground">
          Seuls les responsables HSE peuvent accéder à cette fonctionnalité.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Collaborateurs HSE</h1>
            <p className="text-muted-foreground">
              Suivi des formations et conformité HSE par employé
            </p>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Employés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-green-500" />
                Conformes (≥90%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {employeesTrainingStatus.filter(s => s.complianceRate >= 90).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />À surveiller (70-89%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {
                  employeesTrainingStatus.filter(
                    s => s.complianceRate >= 70 && s.complianceRate < 90,
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Non conformes (&lt;70%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {employeesTrainingStatus.filter(s => s.complianceRate < 70).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous services</SelectItem>
                  {services.map(service => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous rôles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des employés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(renderEmployeeCard)}
        </div>

        {filteredEmployees.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Aucun employé trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog détails employé */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil de formation HSE</DialogTitle>
          </DialogHeader>
          {selectedEmployee && renderEmployeeDetails(selectedEmployee)}
        </DialogContent>
      </Dialog>

      {/* Dialog attribution formation */}
      <Dialog open={showAssignDialog} onOpenChange={() => setShowAssignDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner une formation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Employé:</p>
              <p className="font-medium">
                {selectedEmployee?.firstName} {selectedEmployee?.lastName} (
                {selectedEmployee?.matricule})
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Formation à assigner:</label>
              <Select value={selectedTrainingToAssign} onValueChange={setSelectedTrainingToAssign}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une formation" />
                </SelectTrigger>
                <SelectContent>
                  {trainingModules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title} ({module.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Annuler
              </Button>
              <Button onClick={confirmAssignTraining} disabled={!selectedTrainingToAssign}>
                Assigner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
