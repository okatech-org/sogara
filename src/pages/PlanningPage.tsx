import { useState } from 'react';
import { Calendar, Users, Clock, MapPin, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AppContext';
import { useVacations } from '@/hooks/useVacations';
import { useEmployees } from '@/hooks/useEmployees';

export function PlanningPage() {
  const { hasAnyRole } = useAuth();
  const { vacations, loading } = useVacations();
  const { employees } = useEmployees();
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const canManagePlanning = hasAnyRole(['ADMIN', 'DRH', 'DG']);

  const filteredVacations = vacations.filter(v => {
    const vDate = new Date(v.date);
    const matchesMonth = vDate.getMonth() + 1 === selectedMonth && vDate.getFullYear() === selectedYear;
    const matchesEmployee = selectedEmployee === 'all' || v.employeeId === selectedEmployee;
    return matchesMonth && matchesEmployee;
  });

  const stats = {
    total: filteredVacations.length,
    completed: filteredVacations.filter(v => v.status === 'COMPLETED').length,
    planned: filteredVacations.filter(v => v.status === 'PLANNED' || v.status === 'CONFIRMED').length,
    inProgress: filteredVacations.filter(v => v.status === 'IN_PROGRESS').length,
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion du Planning</h1>
          <p className="text-muted-foreground">
            Planification des vacations et gestion des horaires
          </p>
        </div>
        {canManagePlanning && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Créer une vacation
          </Button>
        )}
      </div>

      {/* Filtres */}
      <Card className="industrial-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
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
            <div>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Employé</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les employés</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.matricule})
                    </SelectItem>
                  ))}
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
            <CardTitle className="text-sm">Total vacations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Planifiées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.planned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des vacations */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle>Vacations - {months[selectedMonth - 1]} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVacations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune vacation pour cette période</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVacations.map(vacation => {
                const employee = employees.find(e => e.id === vacation.employeeId);
                
                return (
                  <div 
                    key={vacation.id} 
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            vacation.status === 'COMPLETED' ? 'default' :
                            vacation.status === 'IN_PROGRESS' ? 'secondary' :
                            'outline'
                          }>
                            {vacation.status}
                          </Badge>
                          <span className="font-medium">
                            {employee?.firstName} {employee?.lastName}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>{new Date(vacation.date).toLocaleDateString('fr-FR')}</div>
                          <div>{vacation.siteName}</div>
                          <div>{vacation.plannedHours}h</div>
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

