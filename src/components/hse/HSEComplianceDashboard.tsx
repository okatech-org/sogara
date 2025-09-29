import { useState } from 'react';
import { Shield, AlertCircle, TrendingUp, TrendingDown, Users, Building, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplianceData, EmployeeCompliance, UserRole } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { useHSECompliance } from '@/hooks/useHSECompliance';
import { useApp } from '@/contexts/AppContext';
import { HSEComplianceMatrix } from './HSEComplianceMatrix';

export function HSEComplianceDashboard() {
  const { state } = useApp();
  const { 
    getOverallCompliance, 
    generateComplianceReport, 
    getEmployeesRequiringAction,
    getComplianceTrends
  } = useHSECompliance();
  
  const [selectedService, setSelectedService] = useState<string>('all');
  const [reportData, setReportData] = useState<any>(null);

  const overallCompliance = getOverallCompliance();
  const complianceReport = generateComplianceReport();
  const employeesNeedingAction = getEmployeesRequiringAction();
  const complianceTrends = getComplianceTrends(6);

  const services = [...new Set(state.employees.map(emp => emp.service))];

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-green-500';
    if (rate >= 80) return 'text-yellow-600';
    if (rate >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceVariant = (rate: number): "success" | "warning" | "urgent" | "info" => {
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'warning';
    return 'urgent';
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Shield className="w-4 h-4 text-green-500" />;
    }
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="industrial-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Conformité Globale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getComplianceColor(overallCompliance)}`}>
            {overallCompliance}%
          </div>
          <div className="flex items-center gap-2 mt-2">
            {overallCompliance >= 90 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {overallCompliance >= 90 ? 'Conforme' : 'À améliorer'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Employés non conformes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {employeesNeedingAction.length}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Sur {state.employees.length} employés
          </div>
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Formations expirées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            {complianceReport.employeesWithExpiredTrainings.length}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Certificats expirés
          </div>
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Expirations prochaines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">
            {complianceReport.employeesWithExpiringTrainings.length}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Dans les 30 prochains jours
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderServiceCompliance = () => (
    <div className="space-y-4">
      {complianceReport.serviceCompliance
        .sort((a, b) => b.complianceRate - a.complianceRate)
        .map((service, index) => (
        <Card key={service.service} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">{service.service}</h3>
                <p className="text-sm text-muted-foreground">
                  {service.employeesCount} employé(s)
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <StatusBadge 
                status={`${service.complianceRate}%`}
                variant={getComplianceVariant(service.complianceRate)}
              />
              {service.expiredTrainings > 0 && (
                <div className="text-xs text-red-500 mt-1">
                  {service.expiredTrainings} formation(s) expirée(s)
                </div>
              )}
            </div>
          </div>
          
          <Progress value={service.complianceRate} className="h-2" />
        </Card>
      ))}
    </div>
  );

  const renderEmployeesNeedingAction = () => (
    <div className="space-y-4">
      {employeesNeedingAction.slice(0, 10).map((item) => (
        <Card key={item.employee.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getPriorityIcon(item.priority)}
              <div className="space-y-1">
                <h3 className="font-medium">
                  {item.employee.firstName} {item.employee.lastName}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {item.employee.matricule} • {item.employee.service}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.issues.map((issue, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {issue}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <StatusBadge 
                status={`${item.compliance.rate}%`}
                variant={getComplianceVariant(item.compliance.rate)}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {item.compliance.completed}/{item.compliance.totalRequired} formations
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      {employeesNeedingAction.length > 10 && (
        <div className="text-center py-4">
          <Button variant="outline">
            Voir tous les employés ({employeesNeedingAction.length})
          </Button>
        </div>
      )}
    </div>
  );

  const renderComplianceTrends = () => (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Évolution de la conformité</h3>
          <Badge variant="outline">6 derniers mois</Badge>
        </div>
        
        <div className="space-y-2">
          {complianceTrends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm">{trend.month}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${trend.compliance}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${getComplianceColor(trend.compliance)}`}>
                  {trend.compliance}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const generateReport = () => {
    const report = generateComplianceReport();
    setReportData(report);
    
    // Ici on pourrait déclencher un téléchargement ou ouvrir une modal avec le rapport
    console.log('Rapport de conformité généré:', report);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conformité HSE</h2>
          <p className="text-muted-foreground">
            Suivi de la conformité réglementaire et des certifications
          </p>
        </div>
        
        <Button onClick={generateReport} className="gap-2">
          <Award className="w-4 h-4" />
          Générer rapport
        </Button>
      </div>

      {/* KPIs */}
      {renderOverviewCards()}

      {/* Onglets détaillés */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Matrice détaillée</TabsTrigger>
          <TabsTrigger value="services">Par service</TabsTrigger>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <HSEComplianceMatrix 
            employees={state.employees}
            trainings={state.hseTrainings}
          />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>Conformité par service</CardTitle>
            </CardHeader>
            <CardContent>
              {renderServiceCompliance()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Employés nécessitant une attention</CardTitle>
                <Badge variant="destructive">
                  {employeesNeedingAction.length} employé(s)
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {employeesNeedingAction.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium mb-2">Excellente conformité !</h3>
                  <p className="text-muted-foreground">
                    Tous les employés sont en conformité avec les exigences HSE.
                  </p>
                </div>
              ) : (
                renderEmployeesNeedingAction()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {renderComplianceTrends()}
          
          {complianceReport.servicesNeedingAttention.length > 0 && (
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Services nécessitant une attention particulière</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceReport.servicesNeedingAttention.map((service) => (
                    <div key={service.service} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{service.service}</h4>
                        <p className="text-sm text-muted-foreground">
                          {service.employeesCount} employé(s)
                        </p>
                      </div>
                      <StatusBadge 
                        status={`${service.complianceRate}%`}
                        variant="urgent"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
