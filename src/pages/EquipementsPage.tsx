import { useState } from 'react';
import { HardHat, Search, Plus, Settings, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEquipment } from '@/hooks/useEquipment';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AppContext';
import { Equipment, EquipmentStatus } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';

export function EquipementsPage() {
  const { equipment, assignEquipment, unassignEquipment } = useEquipment();
  const { employees } = useEmployees();
  const { hasAnyRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EquipmentStatus>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const canManageEquipment = hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR']);

  const filteredEquipment = equipment.filter(eq => {
    const holder = employees.find(e => e.id === eq.holderEmployeeId);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = (
      eq.label.toLowerCase().includes(searchLower) ||
      eq.type.toLowerCase().includes(searchLower) ||
      eq.serialNumber?.toLowerCase().includes(searchLower) ||
      holder?.firstName.toLowerCase().includes(searchLower) ||
      holder?.lastName.toLowerCase().includes(searchLower)
    );

    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusVariants = {
    operational: { label: 'Opérationnel', variant: 'operational' as const },
    maintenance: { label: 'Maintenance', variant: 'maintenance' as const },
    out_of_service: { label: 'Hors service', variant: 'urgent' as const },
  };

  const getHolderName = (holderId?: string) => {
    if (!holderId) return 'Non affecté';
    const holder = employees.find(e => e.id === holderId);
    return holder ? `${holder.firstName} ${holder.lastName}` : 'Employé inconnu';
  };

  const stats = {
    operational: equipment.filter(e => e.status === 'operational').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    outOfService: equipment.filter(e => e.status === 'out_of_service').length,
    needsCheck: equipment.filter(e => {
      if (!e.nextCheckDate) return false;
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return e.nextCheckDate <= nextWeek;
    }).length,
  };

  const statsCards = [
    {
      title: 'Opérationnels',
      value: stats.operational,
      icon: HardHat,
      color: 'text-success',
    },
    {
      title: 'En maintenance',
      value: stats.maintenance,
      icon: Settings,
      color: 'text-warning',
    },
    {
      title: 'Hors service',
      value: stats.outOfService,
      icon: HardHat,
      color: 'text-destructive',
    },
    {
      title: 'Contrôles à venir',
      value: stats.needsCheck,
      icon: Calendar,
      color: 'text-warning',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Équipements</h1>
          <p className="text-muted-foreground">
            Gestion des équipements de travail et EPI
          </p>
        </div>
        {canManageEquipment && (
          <Button className="gap-2 gradient-primary">
            <Plus className="w-4 h-4" />
            Nouvel équipement
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="industrial-card">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'text-destructive' ? 'bg-destructive/10' :
                  stat.color === 'text-warning' ? 'bg-warning/10' :
                  stat.color === 'text-success' ? 'bg-success/10' : 'bg-primary/10'
                }`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher par nom, type ou détenteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'operational', 'maintenance', 'out_of_service'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'Tous' : statusVariants[status as EquipmentStatus]?.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHat className="w-5 h-5" />
                Catalogue ({filteredEquipment.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEquipment.map((eq) => {
                  const statusInfo = statusVariants[eq.status];
                  
                  return (
                    <div
                      key={eq.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                        selectedEquipment?.id === eq.id 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border bg-card hover:bg-muted/30'
                      }`}
                      onClick={() => setSelectedEquipment(eq)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <HardHat className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">
                              {eq.label}
                            </h3>
                            <div className="text-sm text-muted-foreground">
                              <p>Type: {eq.type}</p>
                              {eq.serialNumber && <p>N° série: {eq.serialNumber}</p>}
                              <p>Détenteur: {getHolderName(eq.holderEmployeeId)}</p>
                              {eq.nextCheckDate && (
                                <p>Prochain contrôle: {new Date(eq.nextCheckDate).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StatusBadge 
                            status={statusInfo.label} 
                            variant={statusInfo.variant}
                          />
                          {eq.holderEmployeeId ? (
                            <Badge variant="outline" className="gap-1">
                              <User className="w-3 h-3" />
                              Affecté
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Disponible
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEquipment.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <HardHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun équipement trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedEquipment ? (
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Détails de l'équipement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HardHat className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {selectedEquipment.label}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {selectedEquipment.type}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Informations générales</h4>
                  <div className="space-y-2 text-sm">
                    {selectedEquipment.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">N° série:</span>
                        <span>{selectedEquipment.serialNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut:</span>
                      <StatusBadge 
                        status={statusVariants[selectedEquipment.status].label} 
                        variant={statusVariants[selectedEquipment.status].variant}
                      />
                    </div>
                    {selectedEquipment.location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Localisation:</span>
                        <span>{selectedEquipment.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Affectation</h4>
                  <div className="text-sm">
                    {selectedEquipment.holderEmployeeId ? (
                      <div className="flex items-center gap-2 p-2 bg-success/10 rounded border border-success/20">
                        <User className="w-4 h-4 text-success" />
                        <span>{getHolderName(selectedEquipment.holderEmployeeId)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <span className="text-muted-foreground">Non affecté</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedEquipment.nextCheckDate && (
                  <div>
                    <h4 className="font-medium mb-2">Maintenance</h4>
                    <div className="text-sm">
                      <div className="flex items-center gap-2 p-2 bg-warning/10 rounded border border-warning/20">
                        <Calendar className="w-4 h-4 text-warning" />
                        <span>Contrôle prévu: {new Date(selectedEquipment.nextCheckDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEquipment.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedEquipment.description}
                    </p>
                  </div>
                )}

                {canManageEquipment && (
                  <div className="pt-4 border-t space-y-2">
                    {selectedEquipment.holderEmployeeId ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => unassignEquipment(selectedEquipment.id)}
                      >
                        Libérer l'équipement
                      </Button>
                    ) : (
                      <Button className="w-full gradient-primary">
                        Affecter à un employé
                      </Button>
                    )}
                    <Button className="w-full" variant="outline">
                      Modifier l'équipement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="industrial-card">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HardHat className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Sélectionnez un équipement pour voir ses détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}