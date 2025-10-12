import { useState } from 'react';
import { 
  HardHat, Shield, BookOpen, Award, Calendar, Clock, AlertTriangle, 
  CheckCircle, TrendingUp, FileText, User, Briefcase, Target, Package 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useEmployeeHSEInbox } from '@/hooks/useEmployeeHSEInbox';
import { useEquipment } from '@/hooks/useEquipment';
import { useDashboard } from '@/hooks/useDashboard';
import { EmployeeHSEInbox } from '@/components/employee/EmployeeHSEInbox';

export function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const { stats, recentNotifications, markNotificationAsRead } = useDashboard();
  const { employees } = useEmployees();
  const { equipment } = useEquipment();
  const [showHSEInbox, setShowHSEInbox] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState('profile');
  
  const { 
    unreadCount, 
    complianceRate, 
    pendingTrainings, 
    completedTrainings,
    myAlerts 
  } = useEmployeeHSEInbox(currentUser?.id || '');

  // Mes équipements affectés
  const myEquipment = equipment.filter(eq => eq.holderEmployeeId === currentUser?.id);

  // Mes statistiques personnelles
  const myStats = currentUser?.stats || {
    visitsReceived: 0,
    packagesReceived: 0,
    hseTrainingsCompleted: 0
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête personnalisé */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Bonjour, {currentUser?.firstName} !
                </h1>
                <p className="text-muted-foreground">
                  {currentUser?.jobTitle || 'Technicien Raffinage'} • {currentUser?.service || 'Production'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="mt-2">
              {currentUser?.matricule}
            </Badge>
          </div>
          
          {/* Conformité HSE visible */}
          <div className="text-center md:text-right">
            <div className={`text-5xl font-bold mb-1 ${
              complianceRate >= 90 ? 'text-green-600' :
              complianceRate >= 70 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {complianceRate}%
            </div>
            <p className="text-sm text-muted-foreground">Conformité HSE</p>
            {complianceRate < 90 && (
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => setShowHSEInbox(true)}
              >
                Améliorer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Alertes urgentes si formations en retard */}
      {pendingTrainings.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">
                  {pendingTrainings.length} formation{pendingTrainings.length > 1 ? 's' : ''} HSE en attente
                </p>
                <p className="text-sm text-yellow-800">
                  Complétez vos formations pour maintenir votre conformité
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowHSEInbox(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Voir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs Personnels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-500" />
              <span className="hidden md:inline">Formations</span>
              <span className="md:hidden">Form.</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {completedTrainings.length}
            </div>
            <p className="text-xs text-muted-foreground">Complétées</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm flex items-center gap-2">
              <HardHat className="w-4 h-4 text-blue-500" />
              <span className="hidden md:inline">Équipements</span>
              <span className="md:hidden">EPI</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">
              {myEquipment.length}
            </div>
            <p className="text-xs text-muted-foreground">Affectés</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="hidden md:inline">Habilitations</span>
              <span className="md:hidden">Hab.</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-purple-600">
              {currentUser?.habilitations.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Actives</p>
          </CardContent>
        </Card>

        <Card 
          className={`industrial-card cursor-pointer hover:shadow-lg transition-all ${
            unreadCount > 0 ? 'border-2 border-primary' : ''
          }`}
          onClick={() => setShowHSEInbox(true)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              <span className="hidden md:inline">HSE</span>
              <span className="md:hidden">HSE</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-orange-600">
              {unreadCount}
            </div>
            <p className="text-xs text-muted-foreground">Nouveaux</p>
            {unreadCount > 0 && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute top-2 right-2" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mon Espace HSE - Prioritaire */}
        <Card 
          className={`industrial-card lg:col-span-2 cursor-pointer hover:shadow-xl transition-all ${
            unreadCount > 0 ? 'border-2 border-primary shadow-lg' : ''
          }`}
          onClick={() => setShowHSEInbox(true)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  complianceRate >= 90 ? 'bg-green-100' :
                  complianceRate >= 70 ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  <Shield className={`w-5 h-5 ${
                    complianceRate >= 90 ? 'text-green-600' :
                    complianceRate >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                </div>
                Mon Espace HSE
              </CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barre conformité */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Ma conformité HSE</span>
                <Badge variant={complianceRate >= 90 ? "default" : complianceRate >= 70 ? "secondary" : "destructive"}>
                  {complianceRate}%
                </Badge>
              </div>
              <Progress 
                value={complianceRate} 
                className={`h-3 ${
                  complianceRate >= 90 ? 'bg-green-100' :
                  complianceRate >= 70 ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}
              />
            </div>

            {/* Grille formations */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{pendingTrainings.length}</div>
                <div className="text-xs text-muted-foreground">À faire</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{pendingTrainings.filter(t => t.status === 'in_progress').length}</div>
                <div className="text-xs text-muted-foreground">En cours</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedTrainings.length}</div>
                <div className="text-xs text-muted-foreground">Complétées</div>
              </div>
            </div>

            {/* Alertes si existantes */}
            {myAlerts.filter(a => a.status === 'sent' || a.status === 'received').length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    {myAlerts.filter(a => a.status === 'sent' || a.status === 'received').length} alerte(s) non lue(s)
                  </span>
                </div>
              </div>
            )}

            <Button className="w-full gap-2" onClick={(e) => { e.stopPropagation(); setShowHSEInbox(true); }}>
              <BookOpen className="w-4 h-4" />
              Ouvrir mon espace HSE
              {unreadCount > 0 && <Badge className="ml-auto bg-white text-primary">{unreadCount}</Badge>}
            </Button>
          </CardContent>
        </Card>

        {/* Mes Informations - Mobile friendly */}
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Mes Informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeInfoTab} onValueChange={setActiveInfoTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="text-xs">Profil</TabsTrigger>
                <TabsTrigger value="skills" className="text-xs">Compét.</TabsTrigger>
                <TabsTrigger value="habilit" className="text-xs">Habil.</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matricule:</span>
                    <span className="font-medium">{currentUser?.matricule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{currentUser?.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-xs">{currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut:</span>
                    <Badge variant="secondary">{currentUser?.status === 'active' ? 'Actif' : 'Inactif'}</Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-2">
                {currentUser?.competences.map((comp, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                    <Briefcase className="w-3 h-3 text-blue-600" />
                    <span>{comp}</span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="habilit" className="space-y-2">
                {currentUser?.habilitations.map((hab, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>{hab}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Mes Équipements EPI */}
      <Card className="industrial-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HardHat className="w-5 h-5" />
              Mes Équipements de Protection
            </CardTitle>
            <Badge>{myEquipment.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {myEquipment.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HardHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun équipement affecté</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myEquipment.map((eq) => (
                <div key={eq.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{eq.label}</h4>
                    <Badge 
                      variant={
                        eq.status === 'operational' ? 'default' :
                        eq.status === 'maintenance' ? 'secondary' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {eq.status === 'operational' ? 'OK' :
                       eq.status === 'maintenance' ? 'Maint.' :
                       'HS'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {eq.type} {eq.serialNumber ? `• ${eq.serialNumber}` : ''}
                  </p>
                  {eq.nextCheckDate && (
                    <p className="text-xs text-muted-foreground">
                      Prochain contrôle: {new Date(eq.nextCheckDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mes Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Mes Indicateurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Visites reçues</span>
              </div>
              <Badge variant="outline">{myStats.visitsReceived}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-green-500" />
                <span className="text-sm">Colis reçus</span>
              </div>
              <Badge variant="outline">{myStats.packagesReceived}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Formations HSE</span>
              </div>
              <Badge variant="outline">{myStats.hseTrainingsCompleted}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Notifications récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentNotifications.length > 0 ? (
                recentNotifications.slice(0, 3).map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className={`p-1 rounded-full mt-0.5 ${
                      notification.type === 'urgent' ? 'bg-destructive/20' :
                      notification.type === 'warning' ? 'bg-warning/20' :
                      notification.type === 'success' ? 'bg-success/20' : 'bg-primary/20'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        notification.type === 'urgent' ? 'bg-destructive' :
                        notification.type === 'warning' ? 'bg-warning' :
                        notification.type === 'success' ? 'bg-success' : 'bg-primary'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accès rapides - Mobile optimisé */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Accès Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setShowHSEInbox(true)}
            >
              <Shield className="w-6 h-6 text-orange-500" />
              <span className="text-xs">Mon HSE</span>
              {unreadCount > 0 && <Badge className="absolute top-1 right-1 h-5 w-5 p-0 text-xs">{unreadCount}</Badge>}
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => window.location.href = '/app/connect'}
            >
              <FileText className="w-6 h-6 text-blue-500" />
              <span className="text-xs">Actualités</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              disabled
            >
              <Calendar className="w-6 h-6 text-green-500" />
              <span className="text-xs">Planning</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Mon Espace HSE */}
      <Dialog open={showHSEInbox} onOpenChange={setShowHSEInbox}>
        <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mon Espace HSE Personnel</DialogTitle>
          </DialogHeader>
          <EmployeeHSEInbox employeeId={currentUser?.id || ''} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

