import { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Plus,
  Sparkles,
  QrCode,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  LogOut,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AppContext'
import { RegisterVisitorWithAI } from '@/components/dialogs/RegisterVisitorWithAI'
import { visitorService, VisitorExtended } from '@/services/visitor-management.service'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function VisitesPageAI() {
  const { hasAnyRole, currentUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [visitors, setVisitors] = useState<VisitorExtended[]>(visitorService.getAll())
  const [statusFilter, setStatusFilter] = useState<'all' | VisitorExtended['status']>('all')
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorExtended | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const canManage = hasAnyRole(['ADMIN', 'RECEP', 'SUPERVISEUR'])

  const visitorStats = useMemo(() => visitorService.getVisitorStats(), [visitors])

  const filteredVisitors = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()
    return visitors.filter(visitor => {
      const matchesSearch =
        visitor.firstName.toLowerCase().includes(searchLower) ||
        visitor.lastName.toLowerCase().includes(searchLower) ||
        visitor.company?.toLowerCase().includes(searchLower) ||
        visitor.badgeNumber.toLowerCase().includes(searchLower) ||
        visitor.employeeToVisit.toLowerCase().includes(searchLower)

      const matchesFilter = statusFilter === 'all' || visitor.status === statusFilter

      return matchesSearch && matchesFilter
    })
  }, [visitors, searchTerm, statusFilter])

  const handleVisitorRegistered = (visitor: VisitorExtended) => {
    setVisitors(prev => [visitor, ...prev])
    setShowRegisterDialog(false)
    toast({
      title: 'Visiteur enregistré',
      description: `${visitor.firstName} ${visitor.lastName} - Badge ${visitor.badgeNumber}`,
    })
  }

  const handleCheckOut = async (visitorId: string) => {
    try {
      await visitorService.checkOutVisitor(visitorId)
      setVisitors(visitorService.getAll())
      toast({
        title: 'Sortie enregistrée',
        description: 'Le visiteur a été désenregistré avec succès',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'enregistrer la sortie",
        variant: 'destructive',
      })
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setVisitors(visitorService.getAll())
      setIsRefreshing(false)
      toast({
        title: 'Données actualisées',
        description: 'Liste des visiteurs rechargée',
      })
    }, 500)
  }

  const getStatusColor = (status: VisitorExtended['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-500'
      case 'completed':
        return 'bg-gray-500'
      case 'overdue':
        return 'bg-red-500'
      case 'emergency_exit':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getUrgencyBadge = (level: VisitorExtended['urgencyLevel']) => {
    switch (level) {
      case 'vip':
        return (
          <Badge variant="destructive" className="gap-1 text-xs">
            ⭐ VIP
          </Badge>
        )
      case 'high':
        return (
          <Badge variant="secondary" className="gap-1 text-xs">
            Prioritaire
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Gestion des Visiteurs
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              IA Activée
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Enregistrement automatique avec extraction IA des pièces d'identité
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button onClick={() => setShowRegisterDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau visiteur
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              Actualiser
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{visitorStats.present}</div>
              <div className="text-sm text-muted-foreground">Présents</div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{visitorStats.todayVisitors}</div>
              <div className="text-sm text-muted-foreground">Aujourd'hui</div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{visitorStats.overdue}</div>
              <div className="text-sm text-muted-foreground">En retard</div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{visitorStats.vip}</div>
              <div className="text-sm text-muted-foreground">VIP</div>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{visitorStats.aiExtracted}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Extraits IA
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, société, badge..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="present">Présents</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="emergency_exit">Sortie urgence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des visiteurs */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Visiteurs ({filteredVisitors.length})
            </span>
            {visitorStats.averageDuration > 0 && (
              <Badge variant="outline" className="text-xs">
                Durée moyenne: {visitorStats.averageDuration} min
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredVisitors.map(visitor => {
              const isPresent = visitor.status === 'present'
              const isOverdue =
                visitor.status === 'overdue' ||
                (isPresent &&
                  visitor.expectedCheckOut &&
                  new Date(visitor.expectedCheckOut) < new Date())

              return (
                <Card
                  key={visitor.id}
                  className={cn(
                    'hover:shadow-md transition-all cursor-pointer',
                    isOverdue && 'border-red-300 bg-red-50',
                  )}
                  onClick={() => setSelectedVisitor(visitor)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {visitor.firstName[0]}
                            {visitor.lastName[0]}
                          </div>
                          <div
                            className={cn(
                              'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white',
                              getStatusColor(visitor.status),
                            )}
                          />
                        </div>

                        {/* Informations */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {visitor.firstName} {visitor.lastName}
                            </h3>

                            {visitor.aiExtracted && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                <Sparkles className="w-3 h-3" />
                                IA {Math.round((visitor.aiConfidence || 0) * 100)}%
                              </Badge>
                            )}

                            {getUrgencyBadge(visitor.urgencyLevel)}

                            <Badge variant="outline" className="text-xs">
                              {visitor.badgeNumber}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            {visitor.company && (
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {visitor.company}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Arrivé{' '}
                              {new Date(visitor.checkInTime).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div>
                              <strong>Objet:</strong> {visitor.purposeOfVisit}
                            </div>
                            <div>
                              <strong>Rendez-vous:</strong>{' '}
                              {visitor.employeeToVisit || visitor.department}
                            </div>
                          </div>

                          {visitor.requiresVerification && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              Vérification requise
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <StatusBadge
                          status={
                            visitor.status === 'present'
                              ? 'Présent'
                              : visitor.status === 'completed'
                                ? 'Sorti'
                                : visitor.status === 'overdue'
                                  ? 'En retard'
                                  : 'Sortie urgence'
                          }
                          variant={
                            visitor.status === 'present'
                              ? 'success'
                              : visitor.status === 'overdue'
                                ? 'urgent'
                                : 'operational'
                          }
                        />

                        {canManage && isPresent && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={e => {
                              e.stopPropagation()
                              handleCheckOut(visitor.id)
                            }}
                            className="gap-2"
                          >
                            <LogOut className="w-3 h-3" />
                            Sortie
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Zones d'accès */}
                    {visitor.accessZones.length > 0 && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Zones autorisées:</span>
                        {visitor.accessZones.map((zone, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {zone}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Warnings */}
                    {visitor.extractionWarnings && visitor.extractionWarnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {visitor.extractionWarnings.map((warning, i) => (
                          <div key={i} className="text-xs text-orange-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {warning}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {filteredVisitors.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Aucun visiteur trouvé</p>
                <p className="text-sm mt-2">
                  {searchTerm
                    ? 'Essayez de modifier votre recherche'
                    : "Aucun visiteur enregistré aujourd'hui"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'enregistrement */}
      {showRegisterDialog && (
        <RegisterVisitorWithAI
          open={showRegisterDialog}
          onSuccess={handleVisitorRegistered}
          onCancel={() => setShowRegisterDialog(false)}
        />
      )}

      {/* Dialog détails visiteur */}
      {selectedVisitor && (
        <Dialog open={!!selectedVisitor} onOpenChange={() => setSelectedVisitor(null)}>
          <DialogContent className="max-w-2xl">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedVisitor.firstName[0]}
                  {selectedVisitor.lastName[0]}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {selectedVisitor.firstName} {selectedVisitor.lastName}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{selectedVisitor.badgeNumber}</Badge>
                    {selectedVisitor.company && (
                      <Badge variant="secondary">{selectedVisitor.company}</Badge>
                    )}
                    {getUrgencyBadge(selectedVisitor.urgencyLevel)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Téléphone</div>
                  <div className="text-muted-foreground">{selectedVisitor.phone}</div>
                </div>
                {selectedVisitor.email && (
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">{selectedVisitor.email}</div>
                  </div>
                )}
                <div>
                  <div className="font-medium">Pièce d'identité</div>
                  <div className="text-muted-foreground">
                    {selectedVisitor.idType} - {selectedVisitor.idNumber}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Nationalité</div>
                  <div className="text-muted-foreground">{selectedVisitor.nationality}</div>
                </div>
                <div>
                  <div className="font-medium">Arrivée</div>
                  <div className="text-muted-foreground">
                    {new Date(selectedVisitor.checkInTime).toLocaleString('fr-FR')}
                  </div>
                </div>
                {selectedVisitor.expectedCheckOut && (
                  <div>
                    <div className="font-medium">Départ prévu</div>
                    <div className="text-muted-foreground">
                      {new Date(selectedVisitor.expectedCheckOut).toLocaleString('fr-FR')}
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <div className="font-medium">Objet de la visite</div>
                  <div className="text-muted-foreground">{selectedVisitor.purposeOfVisit}</div>
                </div>
              </div>

              {selectedVisitor.qrCode && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-6 text-center">
                    <QrCode className="w-24 h-24 mx-auto mb-3 text-primary" />
                    <p className="text-sm text-muted-foreground">Badge QR Code</p>
                  </CardContent>
                </Card>
              )}

              {canManage && selectedVisitor.status === 'present' && (
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    handleCheckOut(selectedVisitor.id)
                    setSelectedVisitor(null)
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Enregistrer la sortie
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
