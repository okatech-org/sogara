import { HardHat, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AppContext';
import { useEquipment } from '@/hooks/useEquipment';

export function MesEquipementsPage() {
  const { currentUser } = useAuth();
  const { equipment } = useEquipment();

  const myEquipment = equipment.filter(eq => eq.holderEmployeeId === currentUser?.id);
  
  const operational = myEquipment.filter(eq => eq.status === 'operational').length;
  const maintenance = myEquipment.filter(eq => eq.status === 'maintenance').length;
  const outOfService = myEquipment.filter(eq => eq.status === 'out_of_service').length;
  const needsCheck = myEquipment.filter(eq => 
    eq.nextCheckDate && new Date(eq.nextCheckDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <HardHat className="w-6 h-6 text-blue-600" />
          </div>
          Mes Équipements de Protection
        </h1>
        <p className="text-muted-foreground mt-2">
          EPI affectés et matériel de sécurité personnel
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total équipements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myEquipment.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Opérationnels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{operational}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{maintenance}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Contrôles à venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{needsCheck}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {needsCheck > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">
                  {needsCheck} équipement{needsCheck > 1 ? 's' : ''} nécessite{needsCheck > 1 ? 'nt' : ''} un contrôle cette semaine
                </p>
                <p className="text-sm text-yellow-800">
                  Présentez-vous au service HSE pour la vérification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des équipements */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mes EPI Affectés</h2>
        {myEquipment.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="text-center py-16">
              <HardHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucun équipement affecté</h3>
              <p className="text-muted-foreground">
                Les équipements qui vous seront attribués apparaîtront ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEquipment.map((eq) => {
              const needsCheckSoon = eq.nextCheckDate && 
                new Date(eq.nextCheckDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

              return (
                <Card 
                  key={eq.id} 
                  className={`industrial-card ${needsCheckSoon ? 'border-yellow-300' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{eq.label}</h3>
                      <Badge 
                        variant={
                          eq.status === 'operational' ? 'default' :
                          eq.status === 'maintenance' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {eq.status === 'operational' ? (
                          <><CheckCircle className="w-3 h-3 mr-1" />OK</>
                        ) : eq.status === 'maintenance' ? (
                          <><Wrench className="w-3 h-3 mr-1" />Maintenance</>
                        ) : (
                          'Hors Service'
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{eq.type}</span>
                      </div>
                      {eq.serialNumber && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Numéro série:</span>
                          <span className="font-medium font-mono text-xs">{eq.serialNumber}</span>
                        </div>
                      )}
                      {eq.location && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Localisation:</span>
                          <span className="font-medium">{eq.location}</span>
                        </div>
                      )}
                      {eq.nextCheckDate && (
                        <div className={`flex justify-between ${needsCheckSoon ? 'text-yellow-600 font-semibold' : ''}`}>
                          <span className="text-muted-foreground">Prochain contrôle:</span>
                          <span>
                            {new Date(eq.nextCheckDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {needsCheckSoon && (
                      <div className="pt-3 border-t">
                        <Badge variant="outline" className="w-full justify-center text-yellow-600 border-yellow-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Contrôle prévu cette semaine
                        </Badge>
                      </div>
                    )}

                    {eq.description && (
                      <p className="text-xs text-muted-foreground pt-2 border-t">
                        {eq.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

