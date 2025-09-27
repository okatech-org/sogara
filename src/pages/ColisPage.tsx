import { useState } from 'react';
import { Package, Mail, Search, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePackages } from '@/hooks/usePackages';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AppContext';
import { PackageMail, PackageStatus } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';

export function ColisPage() {
  const { packages, updatePackageStatus } = usePackages();
  const { employees } = useEmployees();
  const { hasAnyRole, currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PackageStatus>('all');

  const canManagePackages = hasAnyRole(['ADMIN', 'RECEP', 'SUPERVISEUR']);

  const filteredPackages = packages.filter(pkg => {
    const recipient = employees.find(e => e.id === pkg.recipientEmployeeId);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = (
      pkg.reference.toLowerCase().includes(searchLower) ||
      pkg.sender.toLowerCase().includes(searchLower) ||
      pkg.description.toLowerCase().includes(searchLower) ||
      recipient?.firstName.toLowerCase().includes(searchLower) ||
      recipient?.lastName.toLowerCase().includes(searchLower)
    );

    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusVariants = {
    received: { label: 'Reçu', variant: 'info' as const, icon: Package },
    stored: { label: 'En stock', variant: 'warning' as const, icon: Clock },
    delivered: { label: 'Remis', variant: 'success' as const, icon: CheckCircle },
  };

  const handleDelivery = (packageId: string) => {
    updatePackageStatus(packageId, 'delivered', currentUser?.firstName + ' ' + currentUser?.lastName);
  };

  const getRecipientName = (recipientId: string) => {
    const recipient = employees.find(e => e.id === recipientId);
    return recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Destinataire inconnu';
  };

  const stats = {
    received: packages.filter(p => p.status === 'received').length,
    stored: packages.filter(p => p.status === 'stored').length,
    delivered: packages.filter(p => p.status === 'delivered').length,
    urgent: packages.filter(p => p.priority === 'urgent' && p.status !== 'delivered').length,
  };

  const statsCards = [
    {
      title: 'Reçus',
      value: stats.received,
      icon: Package,
      color: 'text-primary',
    },
    {
      title: 'En stock',
      value: stats.stored,
      icon: Clock,
      color: 'text-warning',
    },
    {
      title: 'Remis',
      value: stats.delivered,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      title: 'Urgents',
      value: stats.urgent,
      icon: AlertTriangle,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colis & Courriers</h1>
          <p className="text-muted-foreground">
            Gestion des réceptions et remises
          </p>
        </div>
        {canManagePackages && (
          <Button className="gap-2 gradient-primary">
            <Plus className="w-4 h-4" />
            Nouveau colis
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
            placeholder="Rechercher par référence, expéditeur ou destinataire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'received', 'stored', 'delivered'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'Tous' : statusVariants[status as PackageStatus]?.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventaire ({filteredPackages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPackages.map((pkg) => {
              const statusInfo = statusVariants[pkg.status];
              const TypeIcon = pkg.type === 'package' ? Package : Mail;
              
              return (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-lg border transition-all ${
                    pkg.priority === 'urgent' ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        pkg.priority === 'urgent' ? 'bg-destructive/10' : 'bg-primary/10'
                      }`}>
                        <TypeIcon className={`w-6 h-6 ${
                          pkg.priority === 'urgent' ? 'text-destructive' : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">
                            {pkg.reference}
                          </h3>
                          {pkg.priority === 'urgent' && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Urgent
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {pkg.type === 'package' ? 'Colis' : 'Courrier'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>De: {pkg.sender}</p>
                          <p>Pour: {getRecipientName(pkg.recipientEmployeeId)}</p>
                          <p>Description: {pkg.description}</p>
                          <p>Reçu: {new Date(pkg.receivedAt).toLocaleString()}</p>
                          {pkg.deliveredAt && (
                            <p>Remis: {new Date(pkg.deliveredAt).toLocaleString()} par {pkg.deliveredBy}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <StatusBadge 
                        status={statusInfo.label} 
                        variant={statusInfo.variant}
                      />
                      
                      {canManagePackages && pkg.status !== 'delivered' && (
                        <div className="flex gap-2">
                          {pkg.status === 'received' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updatePackageStatus(pkg.id, 'stored')}
                            >
                              Stocker
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleDelivery(pkg.id)}
                          >
                            Remettre
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {pkg.photoUrl && (
                    <div className="mt-3">
                      <img 
                        src={pkg.photoUrl} 
                        alt="Photo du colis"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun colis ou courrier trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}