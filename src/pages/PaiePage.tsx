import { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AppContext';
import { usePayroll } from '@/hooks/usePayroll';
import { useEmployees } from '@/hooks/useEmployees';
import { payrollCalculator } from '@/services/payroll-calculator.service';

export function PaiePage() {
  const { hasAnyRole } = useAuth();
  const { payslips, generateOrUpdatePayslip, getStats } = usePayroll();
  const { employees } = useEmployees();
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [generating, setGenerating] = useState(false);

  const canManagePayroll = hasAnyRole(['ADMIN', 'DRH', 'DG']);
  
  const stats = getStats(selectedMonth, selectedYear);

  const handleGenerateAll = async () => {
    setGenerating(true);
    
    for (const employee of employees) {
      const baseSalary = 500000; // À récupérer de employee.position.baseSalary
      await generateOrUpdatePayslip(employee.id, baseSalary, selectedMonth, selectedYear);
    }
    
    setGenerating(false);
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const monthPayslips = payslips.filter(p => p.month === selectedMonth && p.year === selectedYear);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion de la Paie</h1>
          <p className="text-muted-foreground">
            Génération automatique et gestion des fiches de paie
          </p>
        </div>
        {canManagePayroll && (
          <Button 
            onClick={handleGenerateAll}
            disabled={generating}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Génération...' : 'Générer toutes les paies'}
          </Button>
        )}
      </div>

      {/* Sélection période */}
      <Card className="industrial-card">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Mois</label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Année</label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fiches générées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPayslips}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Masse salariale brute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {payrollCalculator.formatCurrency(stats.totalGross)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Masse salariale nette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payrollCalculator.formatCurrency(stats.totalNet)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Heures totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalHours.toFixed(0)}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des fiches */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle>Fiches de Paie - {months[selectedMonth - 1]} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {monthPayslips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-4">Aucune fiche de paie pour cette période</p>
              {canManagePayroll && (
                <Button onClick={handleGenerateAll}>
                  Générer les fiches de paie
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {monthPayslips.map(payslip => {
                const employee = employees.find(e => e.id === payslip.employeeId);
                
                return (
                  <div 
                    key={payslip.id} 
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {employee?.firstName} {employee?.lastName}
                          </span>
                          <Badge variant={
                            payslip.status === 'PAID' ? 'default' :
                            payslip.status === 'VALIDATED' ? 'secondary' :
                            'outline'
                          }>
                            {payslip.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>{payslip.totalHours.toFixed(1)}h travaillées</div>
                          <div>Brut: {payrollCalculator.formatCurrency(payslip.grossSalary)}</div>
                          <div className="font-semibold text-green-600">
                            Net: {payrollCalculator.formatCurrency(payslip.netSalary)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

