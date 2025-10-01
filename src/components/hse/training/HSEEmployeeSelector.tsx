import { useState, useEffect } from 'react';
import { User, Search, X, Play, Users, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Employee, UserRole } from '@/types';
import { hseTrainingService } from '@/services/hse-training.service';

interface HSEEmployeeSelectorProps {
  employees: Employee[];
  onSelectEmployee: (employeeId: string) => void;
  onCancel: () => void;
  requiredRoles?: UserRole[];
  module: {
    id: string;
    title: string;
    code: string;
    requiredForRoles: UserRole[];
  };
}

export function HSEEmployeeSelector({ 
  employees, 
  onSelectEmployee, 
  onCancel,
  requiredRoles,
  module 
}: HSEEmployeeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Filtrer les employés éligibles
  const eligibleEmployees = employees.filter(emp => {
    const hasRequiredRole = module.requiredForRoles.some(role => emp.roles.includes(role));
    const matchesSearch = searchTerm === '' || 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || emp.roles.includes(selectedRole as UserRole);
    
    return hasRequiredRole && matchesSearch && matchesRole;
  });

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (eligibleEmployees.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedEmployeeIndex(prev => 
            prev < eligibleEmployees.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedEmployeeIndex(prev => 
            prev > 0 ? prev - 1 : eligibleEmployees.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (eligibleEmployees[selectedEmployeeIndex]) {
            onSelectEmployee(eligibleEmployees[selectedEmployeeIndex].id);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onCancel();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [eligibleEmployees, selectedEmployeeIndex, onSelectEmployee, onCancel]);

  // Reset index when filter changes
  useEffect(() => {
    setSelectedEmployeeIndex(0);
  }, [searchTerm, selectedRole]);

  

  const getRoleColor = (roles: UserRole[]) => {
    if (roles.includes('ADMIN')) return 'destructive';
    if (roles.includes('HSE')) return 'default';
    if (roles.includes('SUPERVISEUR')) return 'secondary';
    return 'outline';
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'HSE': return 'Responsable HSE';
      case 'SUPERVISEUR': return 'Superviseur';
      case 'RECEP': return 'Réceptionniste';
      case 'EMPLOYE': return 'Employé';
      default: return role;
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="space-y-3 p-6 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span className="line-clamp-1">Sélectionner un Employé pour la Formation</span>
          </DialogTitle>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="default" className="font-medium text-xs">
                    {module.code}
                  </Badge>
                  <span className="font-semibold text-blue-900 text-sm sm:text-base line-clamp-1">{module.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-700">
                  Sélectionnez l'employé qui suivra cette formation
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">Rôles requis:</span>
                  <span className="text-blue-700">{module.requiredForRoles.map(getRoleLabel).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">Employés éligibles:</span>
                  <span className="text-blue-700 font-semibold">{eligibleEmployees.length} / {employees.length}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 flex-1 overflow-hidden px-6">
          {/* Filtres améliorés */}
          <Card className="shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3">
                {/* Première ligne : Recherche */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher employé (nom, matricule, service)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm"
                    autoFocus
                  />
                </div>
                
                {/* Deuxième ligne : Filtres et tri */}
                <div className="flex flex-wrap items-center gap-2">
                  <select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-2 h-9 text-sm border border-border rounded-md bg-background hover:border-primary/50 transition-colors"
                  >
                    <option value="all">Tous les rôles</option>
                    {module.requiredForRoles.map(role => (
                      <option key={role} value={role}>{getRoleLabel(role)}</option>
                    ))}
                  </select>

                  {/* Boutons de tri */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      eligibleEmployees.sort((a, b) => 
                        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
                      );
                    }}
                    className="text-xs h-9"
                  >
                    A-Z
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      eligibleEmployees.sort((a, b) => a.service.localeCompare(b.service));
                    }}
                    className="text-xs h-9"
                  >
                    Service
                  </Button>

                  {/* Badge résultat */}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {eligibleEmployees.length} éligible(s)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations sur l'éligibilité - Version responsive */}
          {eligibleEmployees.length === 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Aucun employé éligible trouvé</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {searchTerm 
                        ? 'Aucun employé ne correspond aux critères de recherche'
                        : `Cette formation nécessite les rôles : ${module.requiredForRoles.map(getRoleLabel).join(', ')}`
                      }
                    </p>
                    {searchTerm && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSearchTerm('')}
                        className="mt-2"
                      >
                        Effacer la recherche
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des employés - Version responsive améliorée */}
          {eligibleEmployees.length > 0 && (
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="pb-2 px-4 sm:px-6">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Employés Éligibles</span>
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    {eligibleEmployees.length} trouvé(s)
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Cliquez sur un employé pour démarrer sa formation
                </p>
              </CardHeader>
              <CardContent className="pb-3 px-4 sm:px-6">
                <ScrollArea className="h-[280px] sm:h-[350px] pr-2 sm:pr-4">
                  <div className="space-y-2 sm:space-y-3">
                    {eligibleEmployees.map((employee) => {
                      const progress = hseTrainingService.getOrCreateProgress(employee.id, module.id);
                      const isCompleted = progress.status === 'completed';
                      const isInProgress = progress.status === 'in_progress';
                      const completionRate = progress.completedModules.length > 0 
                        ? Math.round((progress.completedModules.length / 5) * 100)
                        : 0;

                      const isSelected = selectedEmployeeIndex === eligibleEmployees.indexOf(employee);
                      
                      return (
                        <Card 
                          key={employee.id}
                          className={`border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group ${
                            isCompleted ? 'bg-green-50 border-green-200' : 
                            isInProgress ? 'bg-blue-50 border-blue-200' : ''
                          } ${
                            isSelected ? 'ring-2 ring-primary/50 border-primary shadow-lg' : ''
                          }`}
                          onClick={() => onSelectEmployee(employee.id)}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col gap-3">
                              {/* Ligne principale : Avatar + Info + Action */}
                              <div className="flex items-start sm:items-center gap-3">
                                {/* Avatar avec statut */}
                                <div className="relative flex-shrink-0">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-xs sm:text-sm font-bold text-white">
                                      {employee.firstName[0]}{employee.lastName[0]}
                                    </span>
                                  </div>
                                  {isCompleted && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                    </div>
                                  )}
                                  {isInProgress && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                    </div>
                                  )}
                                </div>

                                {/* Informations employé */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-1">
                                    {employee.firstName} {employee.lastName}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-0.5">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{employee.matricule}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                                      <span className="truncate">{employee.service}</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Action principale */}
                                <Button 
                                  size="sm" 
                                  variant={isCompleted ? "outline" : "default"}
                                  className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex-shrink-0"
                                  disabled={isSelecting && selectedEmployeeId === employee.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setIsSelecting(true);
                                    setSelectedEmployeeId(employee.id);
                                    
                                    try {
                                      await new Promise(resolve => setTimeout(resolve, 300));
                                      onSelectEmployee(employee.id);
                                    } catch (error) {
                                      console.error('Erreur sélection employé:', error);
                                    } finally {
                                      setIsSelecting(false);
                                      setSelectedEmployeeId(null);
                                    }
                                  }}
                                >
                                  {isSelecting && selectedEmployeeId === employee.id ? (
                                    <>
                                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span className="hidden sm:inline">Démarrage...</span>
                                    </>
                                  ) : isCompleted ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span className="hidden sm:inline">Revoir</span>
                                    </>
                                  ) : isInProgress ? (
                                    <>
                                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span className="hidden sm:inline">Continuer</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span>Démarrer</span>
                                    </>
                                  )}
                                </Button>
                              </div>

                              {/* Ligne secondaire : Rôles + Progression */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                {/* Rôles */}
                                <div className="flex flex-wrap gap-1">
                                  {employee.roles.slice(0, 2).map(role => (
                                    <Badge 
                                      key={role} 
                                      variant={getRoleColor([role])}
                                      className="text-[10px] sm:text-xs px-1.5 py-0.5"
                                    >
                                      {getRoleLabel(role)}
                                    </Badge>
                                  ))}
                                  {employee.roles.length > 2 && (
                                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                                      +{employee.roles.length - 2}
                                    </Badge>
                                  )}
                                </div>

                                {/* Statut de formation */}
                                <div className="flex items-center gap-2">
                                  {isCompleted ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 text-[10px] sm:text-xs">
                                      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      <span className="hidden sm:inline">Formation terminée</span>
                                      <span className="sm:hidden">Terminée</span>
                                    </Badge>
                                  ) : isInProgress ? (
                                    <>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-[10px] sm:text-xs">
                                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        En cours
                                      </Badge>
                                      {completionRate > 0 && (
                                        <span className="text-[10px] sm:text-xs text-muted-foreground">{completionRate}%</span>
                                      )}
                                    </>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground text-[10px] sm:text-xs">
                                      <span className="hidden sm:inline">Non démarrée</span>
                                      <span className="sm:hidden">À faire</span>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Actions et résumé */}
          <div className="flex flex-col gap-3 pt-3 border-t bg-muted/30 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Button 
                variant="outline" 
                onClick={onCancel} 
                className="gap-2 w-full sm:w-auto"
              >
                <X className="w-4 h-4" />
                Annuler
              </Button>
              
              {eligibleEmployees.length > 0 && (
                <div className="text-xs sm:text-sm text-center sm:text-left text-muted-foreground">
                  <span className="font-medium text-green-600">{eligibleEmployees.length}</span> employé(s) peuvent suivre cette formation
                </div>
              )}
            </div>
            
            {/* Astuces et raccourcis - cachés sur mobile */}
            <div className="hidden lg:flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>Utilisez la recherche pour trouver rapidement un employé</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⌨️</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">↑↓</Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">Enter</Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">Esc</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
