import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserPlus,
  Shield,
  TrendingUp,
  AlertTriangle,
  Award,
  BarChart3,
  UserCog,
  Settings,
  FileText,
} from 'lucide-react'
import { useEmployees } from '@/hooks/useEmployees'
import { CreateEmployeeDialog } from '@/components/dialogs/CreateEmployeeDialog'
import { Employee, UserRole } from '@/types'

export function HSEAdminDashboard() {
  const { employees } = useEmployees()
  const [selectedTab, setSelectedTab] = useState('overview')

  const hsseEmployees = employees.filter(emp =>
    emp.roles.some(role => ['HSE', 'COMPLIANCE', 'SECURITE', 'RECEP'].includes(role)),
  )

  const stats = {
    totalHSSE: hsseEmployees.length,
    chefHSSE: employees.filter(e => e.roles.includes('HSE')).length,
    security: employees.filter(e => e.roles.includes('SECURITE') || e.roles.includes('RECEP'))
      .length,
    compliance: employees.filter(e => e.roles.includes('COMPLIANCE')).length,
    totalIncidents: 0,
    openIncidents: 0,
    trainingCompliance: 0,
  }

  const handleCreateEmployee = (employee: Employee) => {
    console.log('Nouvel employé HSSE créé:', employee)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration HSSE</h1>
          <p className="text-muted-foreground">
            Gestion des équipes, rôles et supervision des services HSSE
          </p>
        </div>
        <CreateEmployeeDialog
          trigger={
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Créer un compte HSSE
            </Button>
          }
          onSuccess={handleCreateEmployee}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Équipe HSSE</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHSSE}</div>
            <p className="text-xs text-muted-foreground">Personnel HSSE et Sécurité</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chefs HSSE</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.chefHSSE}</div>
            <p className="text-xs text-muted-foreground">Responsables actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.security}</div>
            <p className="text-xs text-muted-foreground">Personnel sécurité</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformité</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trainingCompliance}%</div>
            <p className="text-xs text-muted-foreground">Formations à jour</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            Gestion Équipes
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <UserCog className="w-4 h-4" />
            Rôles & Habilitations
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="w-4 h-4" />
            Rapports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques Globales</CardTitle>
                <CardDescription>Performance des services HSSE</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Incidents ouverts</span>
                  <Badge variant="destructive">{stats.openIncidents}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Formations planifiées</span>
                  <Badge variant="outline">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inspections à venir</span>
                  <Badge variant="outline">8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Certifications expirées</span>
                  <Badge variant="warning">3</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
                <CardDescription>Actions des équipes HSSE</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nouvelle formation créée</p>
                      <p className="text-xs text-muted-foreground">Il y a 2 heures • HSE002</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Incident rapporté</p>
                      <p className="text-xs text-muted-foreground">Il y a 5 heures • REC001</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <Award className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Certification validée</p>
                      <p className="text-xs text-muted-foreground">Hier • HSE002</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Équipe HSSE et Sécurité</CardTitle>
              <CardDescription>{hsseEmployees.length} membres actifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hsseEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{employee.matricule}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {employee.roles.map(role => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attribution des Rôles</CardTitle>
              <CardDescription>Gérer les rôles et habilitations des équipes HSSE</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(['HSE', 'COMPLIANCE', 'SECURITE', 'RECEP'] as UserRole[]).map(role => {
                  const count = employees.filter(e => e.roles.includes(role)).length
                  return (
                    <div
                      key={role}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">Rôle {role}</p>
                        <p className="text-sm text-muted-foreground">{count} personnes</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Gérer
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports et Statistiques</CardTitle>
              <CardDescription>Analyses et rapports des services HSSE</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Rapport mensuel HSSE
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Statistiques de conformité
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analyse des incidents
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Award className="w-4 h-4" />
                  Suivi des certifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
