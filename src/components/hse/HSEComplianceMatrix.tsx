import { useMemo } from 'react';
import { Shield, Users, AlertTriangle, CheckCircle, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Employee, HSETraining, UserRole } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useHSECompliance } from '@/hooks/useHSECompliance';
import hseModulesData from '@/data/hse-training-modules.json';

interface ComplianceMatrixProps {
  employees: Employee[];
  trainings: HSETraining[];
}

interface EmployeeComplianceDetail {
  employee: Employee;
  totalRequired: number;
  completed: number;
  expired: number;
  missing: number;
  rate: number;
  criticalMissing: number;
  nextExpiring?: {
    training: string;
    daysUntil: number;
  };
}

export function HSEComplianceMatrix({ employees, trainings }: ComplianceMatrixProps) {
  const { checkEmployeeCompliance } = useHSECompliance();

  // Calculer la matrice de conformité détaillée
  const complianceMatrix = useMemo(() => {
    const matrix: EmployeeComplianceDetail[] = [];
    
    employees.forEach(employee => {
      const compliance = checkEmployeeCompliance(employee.id);
      if (!compliance) return;

      // Identifier les formations critiques manquantes
      const requiredTrainings = trainings.filter(training =>
        training.requiredForRoles.some(role => employee.roles.includes(role))
      );

      const criticalModules = hseModulesData.hseTrainingModules.filter(m => 
        m.category === 'Critique' || m.category === 'Obligatoire'
      );

      const criticalMissing = requiredTrainings.filter(training => {
        const isCritical = criticalModules.some(cm => cm.title === training.title);
        const hasCompleted = training.sessions.some(session =>
          session.attendance.some(att => 
            att.employeeId === employee.id && att.status === 'completed'
          )
        );
        return isCritical && !hasCompleted;
      }).length;

      // Trouver la prochaine expiration
      let nextExpiring: { training: string; daysUntil: number } | undefined;
      const now = new Date();
      
      requiredTrainings.forEach(training => {
        training.sessions.forEach(session => {
          const attendance = session.attendance.find(att => 
            att.employeeId === employee.id && 
            att.status === 'completed' &&
            att.expirationDate
          );
          
          if (attendance?.expirationDate && attendance.expirationDate > now) {
            const daysUntil = Math.ceil(
              (attendance.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (!nextExpiring || daysUntil < nextExpiring.daysUntil) {
              nextExpiring = {
                training: training.title,
                daysUntil
              };
            }
          }
        });
      });

      matrix.push({
        employee,
        totalRequired: compliance.totalRequired,
        completed: compliance.completed,
        expired: compliance.expired,
        missing: compliance.missing,
        rate: compliance.rate,
        criticalMissing,
        nextExpiring
      });
    });

    return matrix.sort((a, b) => {
      // Trier par priorité: critique d'abord, puis par taux de conformité croissant
      if (a.criticalMissing !== b.criticalMissing) {
        return b.criticalMissing - a.criticalMissing;
      }
      return a.rate - b.rate;
    });
  }, [employees, trainings, checkEmployeeCompliance]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const totalEmployees = complianceMatrix.length;
    const fullyCompliant = complianceMatrix.filter(item => item.rate === 100).length;
    const criticalIssues = complianceMatrix.filter(item => item.criticalMissing > 0).length;
    const hasExpired = complianceMatrix.filter(item => item.expired > 0).length;
    
    const avgCompliance = Math.round(
      complianceMatrix.reduce((sum, item) => sum + item.rate, 0) / totalEmployees
    );

    return {
      totalEmployees,
      fullyCompliant,
      criticalIssues,
      hasExpired,
      avgCompliance,
      complianceRate: Math.round((fullyCompliant / totalEmployees) * 100)
    };
  }, [complianceMatrix]);

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-green-500';
    if (rate >= 80) return 'text-yellow-600';
    if (rate >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceVariant = (rate: number, hasCritical: boolean): "success" | "warning" | "urgent" | "info" => {
    if (hasCritical) return 'urgent';
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'warning';
    return 'urgent';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Critique': return 'bg-red-100 text-red-800 border-red-200';
      case 'Obligatoire': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Spécialisée': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Management': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Prévention': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderPriorityIcon = (item: EmployeeComplianceDetail) => {
    if (item.criticalMissing > 0) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (item.expired > 0) return <Clock className="w-4 h-4 text-orange-500" />;
    if (item.rate < 90) return <Shield className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* KPIs de conformité */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Conformité moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getComplianceColor(globalStats.avgCompliance)}`}>
              {globalStats.avgCompliance}%
            </div>
            <Progress value={globalStats.avgCompliance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Pleinement conformes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {globalStats.fullyCompliant}
            </div>
            <p className="text-xs text-muted-foreground">
              sur {globalStats.totalEmployees} employés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Problèmes critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {globalStats.criticalIssues}
            </div>
            <p className="text-xs text-muted-foreground">
              Formations critiques manquantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Certifications expirées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {globalStats.hasExpired}
            </div>
            <p className="text-xs text-muted-foreground">
              Employés avec certifications expirées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Matrice de conformité détaillée */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Matrice de conformité individuelle
          </CardTitle>
          <p className="text-muted-foreground">
            Vue détaillée de la conformité par employé
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* En-tête avec légende */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">Légende:</div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span>Critique</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span>Expiré</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-yellow-500" />
                  <span>Attention</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Conforme</span>
                </div>
              </div>
            </div>

            {/* Table des employés */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Conformité</TableHead>
                    <TableHead>Formations</TableHead>
                    <TableHead>Problèmes</TableHead>
                    <TableHead>Prochaine expiration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceMatrix.slice(0, 20).map((item) => (
                    <TableRow key={item.employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderPriorityIcon(item)}
                          <div>
                            <div className="font-medium">
                              {item.employee.firstName} {item.employee.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.employee.matricule}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.employee.service}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge 
                            status={`${item.rate}%`}
                            variant={getComplianceVariant(item.rate, item.criticalMissing > 0)}
                          />
                          <Progress value={item.rate} className="w-16 h-1" />
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          <div>{item.completed}/{item.totalRequired} complétées</div>
                          {item.missing > 0 && (
                            <div className="text-orange-600">{item.missing} manquante(s)</div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {item.criticalMissing > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {item.criticalMissing} critique(s)
                            </Badge>
                          )}
                          {item.expired > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {item.expired} expirée(s)
                            </Badge>
                          )}
                          {item.criticalMissing === 0 && item.expired === 0 && item.rate === 100 && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Conforme
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {item.nextExpiring ? (
                          <div className="text-xs">
                            <div className="font-medium line-clamp-1" title={item.nextExpiring.training}>
                              {item.nextExpiring.training.split(' ')[0]}...
                            </div>
                            <div className={`${
                              item.nextExpiring.daysUntil <= 30 ? 'text-orange-600' : 'text-muted-foreground'
                            }`}>
                              {item.nextExpiring.daysUntil}j
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {(item.criticalMissing > 0 || item.expired > 0) && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              Planifier
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {complianceMatrix.length > 20 && (
              <div className="text-center">
                <Button variant="outline">
                  Voir tous les employés ({complianceMatrix.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Répartition par service */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conformité par service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...new Set(employees.map(emp => emp.service))].map(service => {
                const serviceEmployees = complianceMatrix.filter(item => 
                  item.employee.service === service
                );
                
                if (serviceEmployees.length === 0) return null;
                
                const avgCompliance = Math.round(
                  serviceEmployees.reduce((sum, item) => sum + item.rate, 0) / serviceEmployees.length
                );
                
                const criticalCount = serviceEmployees.filter(item => item.criticalMissing > 0).length;
                
                return (
                  <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{service}</h3>
                      <p className="text-sm text-muted-foreground">
                        {serviceEmployees.length} employé(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {criticalCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {criticalCount} critique(s)
                        </Badge>
                      )}
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getComplianceColor(avgCompliance)}`}>
                          {avgCompliance}%
                        </div>
                        <Progress value={avgCompliance} className="w-20 h-2" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top formations manquantes */}
        <Card>
          <CardHeader>
            <CardTitle>Formations les plus manquées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                complianceMatrix.reduce((acc, item) => {
                  const requiredTrainings = trainings.filter(training =>
                    training.requiredForRoles.some(role => item.employee.roles.includes(role))
                  );
                  
                  requiredTrainings.forEach(training => {
                    const hasCompleted = training.sessions.some(session =>
                      session.attendance.some(att => 
                        att.employeeId === item.employee.id && att.status === 'completed'
                      )
                    );
                    
                    if (!hasCompleted) {
                      acc[training.title] = (acc[training.title] || 0) + 1;
                    }
                  });
                  
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([trainingTitle, count]) => {
                  const module = hseModulesData.hseTrainingModules.find(m => m.title === trainingTitle);
                  return (
                    <div key={trainingTitle} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium line-clamp-1" title={trainingTitle}>
                          {trainingTitle}
                        </h4>
                        {module && (
                          <Badge className={`${getCategoryColor(module.category)} text-xs mt-1`}>
                            {module.category}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">{count}</div>
                        <div className="text-xs text-muted-foreground">employé(s)</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
