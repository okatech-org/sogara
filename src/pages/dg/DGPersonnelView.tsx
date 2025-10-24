import React, { useState, useMemo } from 'react'
import { Search, Filter, Eye, Download, RefreshCw, AlertTriangle, CheckCircle, Users, TrendingUp, Calendar, Award, BarChart3 } from 'lucide-react'
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
import { ServiceChangeApproval } from '@/components/approval/ServiceChangeApproval'

export function DGPersonnelView() {
  const { employees } = useEmployees()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [filterService, setFilterService] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Filtrage des employés
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = 
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.service.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesService = filterService === 'all' || employee.service === filterService
      const matchesStatus = filterStatus === 'all' || employee.status === filterStatus
      
      return matchesSearch && matchesService && matchesStatus
    })
  }, [employees, searchTerm, filterService, filterStatus])

  // Statistiques pour le DG
  const stats = useMemo(() => {
    const total = employees.length
    const active = employees.filter(e => e.status === 'active').length
    const inactive = employees.filter(e => e.status === 'inactive').length
    const services = [...new Set(employees.map(e => e.service))]
    
    return {
      total,
      active,
      inactive,
      services: services.length,
      turnover: 3.2, // Simulation
      vacant: 5, // Simulation
      pendingChanges: 3 // Simulation
    }
  }, [employees])

  // Services uniques pour le filtre
  const uniqueServices = useMemo(() => {
    return [...new Set(employees.map(e => e.service))].sort()
  }, [employees])

  const handleExportData = (format: 'csv' | 'excel' = 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `personnel-export-${timestamp}`
    
    if (format === 'csv') {
      const csvData = [
        ['Matricule', 'Nom', 'Prénom', 'Service', 'Statut', 'Rôles', 'Email', 'Téléphone', 'Date Embauche'],
        ...filteredEmployees.map(emp => [
          emp.matricule,
          emp.lastName,
          emp.firstName,
          emp.service,
          emp.status,
          emp.roles.join(', '),
          emp.email || '',
          emp.phone || '',
          emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('fr-FR') : ''
        ])
      ].map(row => row.join(',')).join('\n')
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      // Pour Excel, on génère un CSV avec séparateur tabulation
      const excelData = [
        ['Matricule', 'Nom', 'Prénom', 'Service', 'Statut', 'Rôles', 'Email', 'Téléphone', 'Date Embauche'],
        ...filteredEmployees.map(emp => [
          emp.matricule,
          emp.lastName,
          emp.firstName,
          emp.service,
          emp.status,
          emp.roles.join(', '),
          emp.email || '',
          emp.phone || '',
          emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('fr-FR') : ''
        ])
      ].map(row => row.join('\t')).join('\n')
      
      const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.xls`
      a.click()
      window.URL.revokeObjectURL(url)
    }
    
    toast({
      title: "Export réussi",
      description: `Les données ont été exportées en ${format.toUpperCase()} avec succès`,
    })
  }

  const handleGenerateReport = () => {
    const reportData = {
      date: new Date().toLocaleDateString('fr-FR'),
      totalEmployees: stats.total,
      activeEmployees: stats.active,
      inactiveEmployees: stats.inactive,
      services: uniqueServices.length,
      turnover: stats.turnover,
      vacant: stats.vacant,
      pendingChanges: stats.pendingChanges,
      employeesByService: uniqueServices.map(service => ({
        service,
        count: employees.filter(emp => emp.service === service).length
      }))
    }

    const reportContent = `
RAPPORT PERSONNEL - ${reportData.date}
=====================================

RÉSUMÉ EXÉCUTIF
- Effectif total: ${reportData.totalEmployees} employés
- Employés actifs: ${reportData.activeEmployees}
- Employés inactifs: ${reportData.inactiveEmployees}
- Services: ${reportData.services}
- Taux de turnover: ${reportData.turnover}%
- Postes vacants: ${reportData.vacant}
- Changements en attente: ${reportData.pendingChanges}

RÉPARTITION PAR SERVICE
${reportData.employeesByService.map(item => `- ${item.service}: ${item.count} employé(s)`).join('\n')}

DÉTAIL DES EMPLOYÉS
${filteredEmployees.map(emp => 
  `${emp.matricule} - ${emp.firstName} ${emp.lastName} (${emp.service}) - ${emp.status}`
).join('\n')}
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-personnel-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Rapport généré",
      description: "Le rapport mensuel a été généré avec succès",
    })
  }

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
  }

  // Données simulées pour les changements de service
  const serviceChanges = [
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'Jean Dupont',
      currentService: 'Production',
      newService: 'HSE',
      requestedBy: 'DRH001',
      requestedDate: '2024-01-15',
      effectiveDate: '2024-02-15',
      reason: 'Reconversion professionnelle vers la sécurité',
      status: 'pending' as const
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'Marie Martin',
      currentService: 'Administration',
      newService: 'RH',
      requestedBy: 'DRH001',
      requestedDate: '2024-01-20',
      effectiveDate: '2024-03-01',
      reason: 'Promotion interne',
      status: 'pending' as const
    }
  ]

  const handleApproveChange = (changeId: string) => {
    toast({
      title: "Changement approuvé",
      description: "Le changement de service a été approuvé",
    })
  }

  const handleRejectChange = (changeId: string) => {
    toast({
      title: "Changement rejeté",
      description: "Le changement de service a été rejeté",
      variant: "destructive"
    })
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec KPIs stratégiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effectif Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} actifs, {stats.inactive} inactifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover YTD</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.turnover}%</div>
            <p className="text-xs text-muted-foreground">
              Taux de rotation annuel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Postes Vacants</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vacant}</div>
            <p className="text-xs text-muted-foreground">
              Recrutements en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingChanges}</div>
            <p className="text-xs text-muted-foreground">
              Changements à valider
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interface principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consultation */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Consultation du Personnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtres */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par nom, matricule, service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">Tous les services</option>
                    {uniqueServices.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>

              {/* Liste des employés */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
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
                        onClick={() => handleViewDetails(employee)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions et validations */}
        <div className="space-y-4">
          {/* Validations en attente */}
          <ServiceChangeApproval
            changes={serviceChanges}
            onApprove={handleApproveChange}
            onReject={handleRejectChange}
          />

          {/* Actions d'export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Rapports & Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleExportData('csv')}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                
                <Button 
                  onClick={() => handleExportData('excel')}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
              
              <Button 
                onClick={handleGenerateReport}
                className="w-full"
                variant="outline"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Rapport Mensuel
              </Button>
              
              <Button 
                className="w-full"
                variant="outline"
                disabled
              >
                <Award className="w-4 h-4 mr-2" />
                Analytics Effectif
              </Button>
            </CardContent>
          </Card>

          {/* Restrictions DG */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 text-sm">
                ⚠️ Restrictions DG
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-amber-700 space-y-2">
              <p>• Création employés → DRH</p>
              <p>• Modification rôles → Admin IT</p>
              <p>• Attributions formations → HSE</p>
              <p>• Gestion paie → DRH</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de détails (simplifié) */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Détails de {selectedEmployee.firstName} {selectedEmployee.lastName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Matricule</label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.matricule}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Service</label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.service}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.phone || 'Non renseigné'}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
