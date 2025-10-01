import { useState, useMemo } from 'react';
import { Package, Mail, Search, Plus, Filter, Sparkles, Download, Eye, Archive, Send, Clock, CheckCircle, AlertTriangle, Loader2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AppContext';
import { RegisterPackageWithAI } from '@/components/dialogs/RegisterPackageWithAI';
import { RegisterMailWithAI } from '@/components/dialogs/RegisterMailWithAI';
import { packageService, PackageItem } from '@/services/package-management.service';
import { mailService, Mail as MailType } from '@/services/mail-management.service';
import { toast } from '@/hooks/use-toast';

export function ColisCourrierPage() {
  const { hasAnyRole } = useAuth();
  const [activeTab, setActiveTab] = useState('colis');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [showMailDialog, setShowMailDialog] = useState(false);
  const [packages, setPackages] = useState<PackageItem[]>(packageService.getAll());
  const [mails, setMails] = useState<MailType[]>(mailService.getAll());
  const [packageFilter, setPackageFilter] = useState<'all' | PackageItem['status']>('all');
  const [mailFilter, setMailFilter] = useState<'all' | MailType['status']>('all');

  const canManage = hasAnyRole(['ADMIN', 'RECEP', 'SUPERVISEUR']);

  const packageStats = useMemo(() => packageService.getPackageStats(), [packages]);
  const mailStats = useMemo(() => mailService.getMailStats(), [mails]);

  const filteredPackages = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return packages.filter(pkg => {
      const matchesSearch = 
        pkg.trackingNumber.toLowerCase().includes(searchLower) ||
        pkg.senderName.toLowerCase().includes(searchLower) ||
        pkg.recipientName.toLowerCase().includes(searchLower) ||
        pkg.recipientDepartment.toLowerCase().includes(searchLower);
      
      const matchesFilter = packageFilter === 'all' || pkg.status === packageFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [packages, searchTerm, packageFilter]);

  const filteredMails = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return mails.filter(mail => {
      const matchesSearch = 
        mail.referenceNumber.toLowerCase().includes(searchLower) ||
        mail.senderName.toLowerCase().includes(searchLower) ||
        mail.recipientName.toLowerCase().includes(searchLower) ||
        mail.keywords?.some(k => k.toLowerCase().includes(searchLower));
      
      const matchesFilter = mailFilter === 'all' || mail.status === mailFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [mails, searchTerm, mailFilter]);

  const handlePackageRegistered = (pkg: PackageItem) => {
    setPackages(prev => [pkg, ...prev]);
    setShowPackageDialog(false);
    toast({
      title: 'Colis enregistré',
      description: `Le colis ${pkg.trackingNumber} a été enregistré`,
    });
  };

  const handleMailRegistered = (mail: MailType) => {
    setMails(prev => [mail, ...prev]);
    setShowMailDialog(false);
    toast({
      title: 'Courrier enregistré',
      description: `Le courrier ${mail.referenceNumber} a été enregistré`,
    });
  };

  const handlePackageStatusUpdate = async (pkgId: string, newStatus: PackageItem['status']) => {
    try {
      await packageService.updatePackageStatus(pkgId, newStatus);
      setPackages(packageService.getAll());
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut du colis a été modifié',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive'
      });
    }
  };

  const handleMailAction = async (mailId: string, action: 'send' | 'read' | 'archive') => {
    try {
      switch (action) {
        case 'send':
          const mail = mails.find(m => m.id === mailId);
          if (mail) await mailService.sendMailToRecipient(mail);
          break;
        case 'read':
          await mailService.markAsRead(mailId, 'user');
          break;
        case 'archive':
          await mailService.archiveMail(mailId);
          break;
      }
      setMails(mailService.getAll());
      toast({
        title: 'Action effectuée',
        description: 'L\'opération a été réalisée avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'effectuer l\'action',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Colis & Courriers</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Gestion intelligente avec IA
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Powered by AI
            </Badge>
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button onClick={() => setShowPackageDialog(true)} className="gap-2">
              <Package className="w-4 h-4" />
              Nouveau colis
            </Button>
            <Button onClick={() => setShowMailDialog(true)} variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Nouveau courrier
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="colis" className="gap-2">
            <Package className="w-4 h-4" />
            Colis ({packageStats.total})
          </TabsTrigger>
          <TabsTrigger value="courriers" className="gap-2">
            <Mail className="w-4 h-4" />
            Courriers ({mailStats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colis" className="space-y-6">
          {/* Stats Colis */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{packageStats.enReception}</div>
                  <div className="text-sm text-muted-foreground">Réception</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{packageStats.enAttente}</div>
                  <div className="text-sm text-muted-foreground">En attente</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{packageStats.livres}</div>
                  <div className="text-sm text-muted-foreground">Livrés</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{packageStats.urgents}</div>
                  <div className="text-sm text-muted-foreground">Urgents</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres Colis */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro, expéditeur, destinataire..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={packageFilter} onValueChange={(value: any) => setPackageFilter(value)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="reception">Réception</SelectItem>
                    <SelectItem value="stockage">Stockage</SelectItem>
                    <SelectItem value="en_attente_retrait">En attente</SelectItem>
                    <SelectItem value="livre">Livré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste Colis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Colis ({filteredPackages.length})
                </span>
                {packageStats.aiScanned > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    {packageStats.aiScanned} scannés IA
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPackages.map(pkg => (
                  <Card key={pkg.id} className="hover:shadow-md transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{pkg.trackingNumber}</h3>
                            {pkg.aiScanned && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                <Sparkles className="w-3 h-3" />
                                IA
                              </Badge>
                            )}
                            {pkg.priority === 'urgent' && (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                Urgent
                              </Badge>
                            )}
                            {pkg.category === 'fragile' && (
                              <Badge variant="secondary" className="text-xs">
                                Fragile
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>De:</strong> {pkg.senderName} {pkg.senderOrganization && `(${pkg.senderOrganization})`}</p>
                            <p><strong>Pour:</strong> {pkg.recipientName} - {pkg.recipientDepartment}</p>
                            {pkg.weight && <p><strong>Poids:</strong> {pkg.weight} kg</p>}
                            {pkg.storageLocation && <p><strong>Emplacement:</strong> {pkg.storageLocation}</p>}
                            {pkg.notes && <p className="text-xs italic">{pkg.notes}</p>}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge
                            status={pkg.status === 'reception' ? 'Réception' : 
                                   pkg.status === 'stockage' ? 'Stockage' :
                                   pkg.status === 'en_attente_retrait' ? 'Attente retrait' :
                                   pkg.status === 'livre' ? 'Livré' : 'Retourné'}
                            variant={pkg.status === 'livre' ? 'success' : 
                                    pkg.status === 'reception' ? 'info' : 'warning'}
                          />
                          
                          {canManage && pkg.status !== 'livre' && (
                            <div className="flex gap-2">
                              {pkg.status === 'reception' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handlePackageStatusUpdate(pkg.id, 'stockage')}
                                >
                                  Stocker
                                </Button>
                              )}
                              {(pkg.status === 'stockage' || pkg.status === 'reception') && (
                                <Button 
                                  size="sm"
                                  onClick={() => handlePackageStatusUpdate(pkg.id, 'livre')}
                                >
                                  Livrer
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredPackages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Aucun colis trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courriers" className="space-y-6">
          {/* Stats Courriers */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{mailStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{mailStats.nonLus}</div>
                  <div className="text-sm text-muted-foreground">Non lus</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{mailStats.urgents}</div>
                  <div className="text-sm text-muted-foreground">Urgents</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{mailStats.aTraiter}</div>
                  <div className="text-sm text-muted-foreground">À traiter</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{mailStats.scannesAujourdhui}</div>
                  <div className="text-sm text-muted-foreground">Scannés aujourd'hui</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres Courriers */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par référence, expéditeur, mots-clés..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={mailFilter} onValueChange={(value: any) => setMailFilter(value)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="recu">Reçu</SelectItem>
                    <SelectItem value="scanne">Scanné</SelectItem>
                    <SelectItem value="envoye">Envoyé</SelectItem>
                    <SelectItem value="lu">Lu</SelectItem>
                    <SelectItem value="archive">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste Courriers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Courriers ({filteredMails.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredMails.map(mail => (
                  <Card key={mail.id} className="hover:shadow-md transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{mail.referenceNumber}</h3>
                            
                            {mail.aiExtracted && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                <Sparkles className="w-3 h-3" />
                                IA {Math.round((mail.aiConfidence || 0) * 100)}%
                              </Badge>
                            )}
                            
                            {mail.confidentiality !== 'normal' && (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <Lock className="w-3 h-3" />
                                {mail.confidentiality === 'tres_confidentiel' ? 'Très confidentiel' : 'Confidentiel'}
                              </Badge>
                            )}
                            
                            {mail.urgency === 'urgent' && (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                Urgent
                              </Badge>
                            )}
                            
                            <Badge variant="outline" className="text-xs">
                              {mail.type}
                            </Badge>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <p><strong>De:</strong> {mail.senderName} {mail.senderOrganization && `(${mail.senderOrganization})`}</p>
                            <p><strong>Pour:</strong> {mail.recipientName} - {mail.recipientDepartment}</p>
                            
                            {mail.summary && (
                              <p className="text-muted-foreground italic mt-2 text-xs">
                                📝 {mail.summary}
                              </p>
                            )}
                            
                            {mail.keywords && mail.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {mail.keywords.map((keyword, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {mail.requiresResponse && (
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-3 h-3 text-orange-600" />
                                <span className="text-xs text-orange-600">
                                  Réponse requise {mail.responseDeadline && `avant le ${new Date(mail.responseDeadline).toLocaleDateString('fr-FR')}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge
                            status={mail.status === 'recu' ? 'Reçu' :
                                   mail.status === 'scanne' ? 'Scanné' :
                                   mail.status === 'envoye' ? 'Envoyé' :
                                   mail.status === 'lu' ? 'Lu' : 'Archivé'}
                            variant={mail.status === 'archive' ? 'operational' :
                                    mail.status === 'lu' ? 'success' :
                                    mail.status === 'envoye' ? 'info' : 'warning'}
                          />
                          
                          {canManage && (
                            <div className="flex flex-wrap gap-2 justify-end">
                              {mail.scanned && mail.documentUrl && (
                                <Button size="sm" variant="outline" className="gap-1 text-xs">
                                  <Eye className="w-3 h-3" />
                                  Voir
                                </Button>
                              )}
                              
                              {mail.status === 'scanne' && mail.recipientEmail && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleMailAction(mail.id, 'send')}
                                  className="gap-1 text-xs"
                                >
                                  <Send className="w-3 h-3" />
                                  Envoyer
                                </Button>
                              )}
                              
                              {mail.status === 'envoye' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleMailAction(mail.id, 'read')}
                                  className="gap-1 text-xs"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Marquer lu
                                </Button>
                              )}
                              
                              {mail.status !== 'archive' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleMailAction(mail.id, 'archive')}
                                  className="gap-1 text-xs"
                                >
                                  <Archive className="w-3 h-3" />
                                  Archiver
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredMails.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Aucun courrier trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showPackageDialog && (
        <RegisterPackageWithAI
          open={showPackageDialog}
          onSuccess={handlePackageRegistered}
          onCancel={() => setShowPackageDialog(false)}
        />
      )}

      {showMailDialog && (
        <RegisterMailWithAI
          open={showMailDialog}
          onSuccess={handleMailRegistered}
          onCancel={() => setShowMailDialog(false)}
        />
      )}
    </div>
  );
}

