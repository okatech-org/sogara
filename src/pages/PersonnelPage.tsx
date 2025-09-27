import { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, HardHat, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AppContext';
import { Employee } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';

export function PersonnelPage() {
  const { employees } = useEmployees();
  const { hasAnyRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const canManagePersonnel = hasAnyRole(['ADMIN', 'SUPERVISEUR']);

  const filteredEmployees = employees.filter(employee => 
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    ADMIN: 'destructive',
    HSE: 'secondary',
    SUPERVISEUR: 'default',
    RECEP: 'secondary',
    EMPLOYE: 'outline',
  } as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personnel</h1>
          <p className="text-muted-foreground">
            Gestion des employés et de leurs habilitations
          </p>
        </div>
        {canManagePersonnel && (
          <Button className="gap-2 gradient-primary">
            <Plus className="w-4 h-4" />
            Nouvel employé
          </Button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher par nom, matricule ou service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtres
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Liste du personnel ({filteredEmployees.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      selectedEmployee?.id === employee.id 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border bg-card hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {employee.firstName} {employee.lastName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{employee.matricule}</span>
                            <span>•</span>
                            <span>{employee.service}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge 
                          status={employee.status === 'active' ? 'Actif' : 'Inactif'} 
                          variant={employee.status === 'active' ? 'success' : 'warning'}
                        />
                        {canManagePersonnel && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {employee.roles.map((role) => (
                        <Badge key={role} variant={roleColors[role]}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun employé trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedEmployee ? (
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Détails de l'employé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-lg font-medium mx-auto mb-3">
                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                  </div>
                  <h3 className="font-semibold text-lg">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {selectedEmployee.matricule} • {selectedEmployee.service}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Rôles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.roles.map((role) => (
                      <Badge key={role} variant={roleColors[role]}>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Compétences</h4>
                  <div className="space-y-1">
                    {selectedEmployee.competences.map((comp, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {comp}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Habilitations</h4>
                  <div className="space-y-1">
                    {selectedEmployee.habilitations.map((hab, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Shield className="w-3 h-3 text-success" />
                        {hab}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Équipements affectés</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardHat className="w-4 h-4" />
                    {selectedEmployee.equipmentIds.length} équipements
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Statistiques</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-medium">{selectedEmployee.stats.visitsReceived}</div>
                      <div className="text-muted-foreground text-xs">Visites reçues</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-medium">{selectedEmployee.stats.packagesReceived}</div>
                      <div className="text-muted-foreground text-xs">Colis reçus</div>
                    </div>
                  </div>
                </div>

                {canManagePersonnel && (
                  <div className="pt-4 border-t">
                    <Button className="w-full gradient-primary">
                      Modifier l'employé
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="industrial-card">
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
    </div>
  );
}