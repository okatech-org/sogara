import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AppContext';
import { Equipment } from '@/types';
import { repositories } from '@/services/repositories';

export function HSEEquipmentManagement() {
  const { state, hasAnyRole } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const canManageEPI = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR']);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const allEquipment = repositories.equipment.getAll();
      setEquipment(allEquipment);
    } catch (error) {
      console.error('Erreur chargement équipements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les équipements
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = searchTerm === '' || 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
    const matchesType = typeFilter === 'all' || eq.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistiques EPI
  const getEPIStats = () => {
    const total = equipment.length;
    const available = equipment.filter(eq => eq.status === 'available').length;
    const assigned = equipment.filter(eq => eq.status === 'assigned').length;
    const maintenance = equipment.filter(eq => eq.status === 'maintenance').length;
    const expired = equipment.filter(eq => eq.status === 'expired').length;

    return { total, available, assigned, maintenance, expired };
  };

  const stats = getEPIStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'info';
      case 'maintenance': return 'warning';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'assigned': return 'Assigné';
      case 'maintenance': return 'Maintenance';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  const handleAssignEquipment = (equipmentId: string, employeeId: string) => {
    try {
      repositories.equipment.assign(equipmentId, employeeId);
      loadEquipment();
    } catch (error) {
      console.error('Erreur assignation:', error);
    }
  };

  const handleUnassignEquipment = (equipmentId: string) => {
    try {
      repositories.equipment.unassign(equipmentId);
      loadEquipment();
    } catch (error) {
      console.error('Erreur désassignation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des équipements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total EPI</div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <div className="text-sm text-muted-foreground">Disponibles</div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
              <div className="text-sm text-muted-foreground">Assignés</div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
              <div className="text-sm text-muted-foreground">Maintenance</div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-muted-foreground">Expirés</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card className="industrial-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="assigned">Assigné</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="safety">Sécurité</SelectItem>
                <SelectItem value="respiratory">Respiratoire</SelectItem>
                <SelectItem value="protective">Protecteur</SelectItem>
                <SelectItem value="electrical">Électrique</SelectItem>
              </SelectContent>
            </Select>

            {canManageEPI && (
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter EPI
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des équipements */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Équipements de Protection Individuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Aucun équipement trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Essayez de modifier les filtres de recherche'
                  : 'Commencez par ajouter des équipements de protection'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Équipement</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead>Prochaine vérification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((eq) => {
                  const assignedEmployee = eq.holderEmployeeId 
                    ? state.employees?.find(emp => emp.id === eq.holderEmployeeId)
                    : null;

                  return (
                    <TableRow key={eq.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{eq.name}</div>
                          <div className="text-sm text-muted-foreground">
                            N° {eq.serialNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{eq.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={getStatusLabel(eq.status)} 
                          variant={getStatusColor(eq.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {assignedEmployee ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{assignedEmployee.firstName} {assignedEmployee.lastName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {eq.nextCheckDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{eq.nextCheckDate.toLocaleDateString('fr-FR')}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non défini</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setSelectedEquipment(eq)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {canManageEPI && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
                                  repositories.equipment.delete(eq.id);
                                  loadEquipment();
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      {canManageEPI && (
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle>Actions Rapides EPI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="gap-2 h-auto p-4">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Export EPI</div>
                  <div className="text-sm text-muted-foreground">Télécharger la liste</div>
                </div>
              </Button>

              <Button variant="outline" className="gap-2 h-auto p-4">
                <Calendar className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Planifier Contrôles</div>
                  <div className="text-sm text-muted-foreground">Vérifications périodiques</div>
                </div>
              </Button>

              <Button variant="outline" className="gap-2 h-auto p-4">
                <AlertTriangle className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">EPI à Vérifier</div>
                  <div className="text-sm text-muted-foreground">
                    {equipment.filter(eq => eq.nextCheckDate && eq.nextCheckDate <= new Date()).length} en retard
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="gap-2 h-auto p-4">
                <Shield className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Audit EPI</div>
                  <div className="text-sm text-muted-foreground">Contrôle global</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog ajout équipement */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un Équipement EPI</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Formulaire d'ajout EPI en cours de développement.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Fonctionnalité disponible prochainement.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog détails équipement */}
      <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'Équipement</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom</label>
                  <p>{selectedEquipment.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Numéro de série</label>
                  <p>{selectedEquipment.serialNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p>{selectedEquipment.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <StatusBadge 
                    status={getStatusLabel(selectedEquipment.status)} 
                    variant={getStatusColor(selectedEquipment.status)}
                  />
                </div>
              </div>

              {canManageEPI && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    Modifier
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Historique
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
