import { useState, useMemo } from 'react'
import {
  Send,
  BookOpen,
  AlertTriangle,
  FileText,
  Calendar,
  ArrowRight,
  Check,
  Award,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HSERecipientSelector } from './HSERecipientSelector'
import { CertificationPathSelector } from './CertificationPathSelector'
import { CertificationCandidateSelector } from './CertificationCandidateSelector'
import { useHSEContent } from '@/hooks/useHSEContent'
import { useCertificationPaths } from '@/hooks/useCertificationPaths'
import { useAuth } from '@/contexts/AppContext'
import { Employee, HSETrainingModule, HSEContentType } from '@/types'
import { toast } from '@/hooks/use-toast'
import hseModulesData from '@/data/hse-training-modules.json'
import evaluationsData from '@/data/evaluations-sogara.json'

interface HSEContentHubProps {
  employees: Employee[]
  trainings?: HSETrainingModule[]
}

export function HSEContentHub({ employees }: HSEContentHubProps) {
  const { currentUser } = useAuth()
  const { createContent, assignContent, stats } = useHSEContent()
  const { assignToCandidate: assignPath } = useCertificationPaths()
  const trainingModules = hseModulesData.hseTrainingModules as HSETrainingModule[]

  const [activeTab, setActiveTab] = useState<'training' | 'alert' | 'document' | 'certification'>(
    'training',
  )

  console.log('📊 HSEContentHub - Employés reçus:', employees.length)
  console.log(
    '👤 User connecté:',
    currentUser?.firstName,
    currentUser?.lastName,
    'ID:',
    currentUser?.id,
  )

  const [selectedTraining, setSelectedTraining] = useState<string>('')
  const [alertMessage, setAlertMessage] = useState('')
  const [alertTitle, setAlertTitle] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [selectedCertificationPath, setSelectedCertificationPath] = useState<string>('')
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [candidateTypes, setCandidateTypes] = useState<Record<string, 'employee' | 'external'>>({})
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [assigningPath, setAssigningPath] = useState(false)

  const handleSend = () => {
    console.log('🚀 handleSend appelé', {
      activeTab,
      selectedEmployees: selectedEmployees.length,
      selectedTraining,
      alertTitle,
      documentName,
    })

    if (selectedEmployees.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un destinataire',
        variant: 'destructive',
      })
      return
    }

    let contentItem
    const baseContent = {
      priority,
      createdBy: currentUser?.id || '4', // ID de HSE001
      targetEmployees: selectedEmployees,
    }

    switch (activeTab) {
      case 'training': {
        if (!selectedTraining) {
          toast({
            title: 'Erreur',
            description: 'Sélectionnez une formation',
            variant: 'destructive',
          })
          return
        }
        const training = trainingModules.find(t => t.id === selectedTraining)
        if (!training) {
          toast({ title: 'Erreur', description: 'Formation non trouvée', variant: 'destructive' })
          return
        }

        contentItem = createContent({
          type: 'training',
          title: training.title,
          description: training.description,
          trainingId: selectedTraining,
          ...baseContent,
        })
        break
      }

      case 'alert':
        if (!alertTitle || !alertMessage) {
          toast({
            title: 'Erreur',
            description: 'Remplissez le titre et le message',
            variant: 'destructive',
          })
          return
        }
        contentItem = createContent({
          type: 'alert',
          title: alertTitle,
          description: alertMessage,
          alertMessage,
          ...baseContent,
        })
        break

      case 'document':
        if (!documentName || !documentUrl) {
          toast({
            title: 'Erreur',
            description: "Remplissez le nom et l'URL du document",
            variant: 'destructive',
          })
          return
        }
        contentItem = createContent({
          type: 'document',
          title: documentName,
          description: `Document HSE: ${documentName}`,
          documentUrl,
          documentName,
          ...baseContent,
        })
        break
    }

    console.log('🔍 Vérification avant envoi:', {
      contentItem: contentItem ? 'Créé' : 'Null',
      contentItemId: contentItem?.id,
      userId: currentUser?.id,
      hasUser: !!currentUser,
      currentUserDetails: { id: currentUser?.id, firstName: currentUser?.firstName },
    })

    if (!contentItem) {
      console.error('❌ ContentItem est null/undefined')
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le contenu HSE',
        variant: 'destructive',
      })
      return
    }

    if (!currentUser?.id) {
      console.error('❌ User ID manquant. CurrentUser:', currentUser)
      toast({
        title: 'Erreur',
        description: 'Utilisateur non identifié. Reconnectez-vous.',
        variant: 'destructive',
      })
      return
    }

    const params = {
      dueDate: dueDate ? new Date(dueDate) : undefined,
      sentBy: currentUser.id,
      notes: customMessage,
    }

    console.log('📤 Envoi contenu:', contentItem)
    console.log('👥 Destinataires:', selectedEmployees)
    console.log('⚙️ Paramètres:', params)

    const result = assignContent(contentItem.id, selectedEmployees, params)

    console.log('✅ Résultat assignContent:', result.length, 'assignments créés')

    // Reset seulement si succès
    if (result.length > 0) {
      setSelectedEmployees([])
      setSelectedTraining('')
      setAlertTitle('')
      setAlertMessage('')
      setDocumentName('')
      setDocumentUrl('')
      setCustomMessage('')
      setDueDate('')
      setShowPreview(false)
    }
  }

  const handleCandidateSelection = (
    ids: string[],
    types: Record<string, 'employee' | 'external'>,
  ) => {
    setSelectedCandidates(ids)
    setCandidateTypes(types)
  }

  const handleAssignPath = async () => {
    if (!selectedCertificationPath || selectedCandidates.length === 0 || !currentUser?.id) {
      toast({
        title: 'Erreur',
        description: 'Sélectionnez un parcours et au moins un candidat',
        variant: 'destructive',
      })
      return
    }

    setAssigningPath(true)

    try {
      const internalCount = Object.values(candidateTypes).filter(t => t === 'employee').length
      const externalCount = Object.values(candidateTypes).filter(t => t === 'external').length

      // Assigner tous les parcours en parallèle pour éviter la boucle
      const assignmentPromises = selectedCandidates.map(async candidateId => {
        const candidateType = candidateTypes[candidateId] || 'employee'
        return assignPath(selectedCertificationPath, candidateId, candidateType, currentUser.id)
      })

      const results = await Promise.all(assignmentPromises)
      const successCount = results.filter(r => r?.success).length
      const offlineCount = results.filter(r => r?.offline).length

      // Reset après succès
      setSelectedCertificationPath('')
      setSelectedCandidates([])
      setCandidateTypes({})

      toast({
        title: '✅ Parcours assignés avec succès',
        description: `${successCount} candidat(s) inscrit(s) au parcours (${internalCount} interne${internalCount > 1 ? 's' : ''}, ${externalCount} externe${externalCount > 1 ? 's' : ''})${offlineCount > 0 ? ` • ${offlineCount} hors ligne` : ''}`,
      })
    } catch (error: any) {
      console.error('❌ Erreur assignation parcours:', error)
      toast({
        title: 'Erreur',
        description: error.message || "Erreur lors de l'assignation",
        variant: 'destructive',
      })
    } finally {
      setAssigningPath(false)
    }
  }

  const canSend = useMemo(() => {
    switch (activeTab) {
      case 'training':
        return selectedEmployees.length > 0 && !!selectedTraining
      case 'alert':
        return selectedEmployees.length > 0 && !!alertTitle && !!alertMessage
      case 'document':
        return selectedEmployees.length > 0 && !!documentName && !!documentUrl
      case 'certification':
        return selectedCandidates.length > 0 && !!selectedCertificationPath
      default:
        return false
    }
  }, [
    activeTab,
    selectedEmployees,
    selectedCandidates,
    selectedTraining,
    alertTitle,
    alertMessage,
    documentName,
    documentUrl,
    selectedCertificationPath,
  ])

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Send className="w-6 h-6 text-primary" />
          Centre d'Envoi HSE
        </h2>
        <p className="text-muted-foreground">
          Transmission de formations, alertes et documents aux collaborateurs
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Contenu total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Envois actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Complétés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedAssignments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sélection du type de contenu */}
      <Tabs
        value={activeTab}
        onValueChange={v => setActiveTab(v as typeof activeTab)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="training">
            <BookOpen className="w-4 h-4 mr-2" />
            Formations
          </TabsTrigger>
          <TabsTrigger value="alert">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alertes & Infos
          </TabsTrigger>
          <TabsTrigger value="document">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="certification">
            <Award className="w-4 h-4 mr-2" />
            Parcours Certification
          </TabsTrigger>
        </TabsList>

        {/* Onglet Formations */}
        <TabsContent value="training" className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>1. Sélection de la formation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Formation à assigner</Label>
                <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez une formation..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trainingModules.map(module => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.code} - {module.title} ({module.duration}
                        {module.durationUnit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTraining &&
                (() => {
                  const training = trainingModules.find(t => t.id === selectedTraining)
                  return training ? (
                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            training.category === 'Critique'
                              ? 'bg-red-500'
                              : training.category === 'Obligatoire'
                                ? 'bg-orange-500'
                                : 'bg-blue-500'
                          }
                        >
                          {training.category}
                        </Badge>
                        <Badge variant="outline">{training.code}</Badge>
                      </div>
                      <h4 className="font-semibold">{training.title}</h4>
                      <p className="text-sm text-muted-foreground">{training.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          Durée: {training.duration} {training.durationUnit}
                        </span>
                        <span>Validité: {training.validityMonths} mois</span>
                        {training.certification.passingScore && (
                          <span>Score requis: {training.certification.passingScore}%</span>
                        )}
                      </div>
                    </div>
                  ) : null
                })()}
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>2. Destinataires</CardTitle>
            </CardHeader>
            <CardContent>
              <HSERecipientSelector
                employees={employees}
                onSelectionChange={setSelectedEmployees}
                preSelectedIds={selectedEmployees}
              />
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>3. Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Priorité</Label>
                  <Select value={priority} onValueChange={v => setPriority(v as typeof priority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Échéance (optionnel)</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Message personnalisé (optionnel)</Label>
                <Textarea
                  placeholder="Ajoutez un message pour les collaborateurs..."
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Alertes */}
        <TabsContent value="alert" className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>1. Création de l'alerte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre de l'alerte</Label>
                <Input
                  placeholder="Ex: Nouvelle procédure H2S"
                  value={alertTitle}
                  onChange={e => setAlertTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  placeholder="Contenu de l'alerte sécurité..."
                  value={alertMessage}
                  onChange={e => setAlertMessage(e.target.value)}
                  rows={5}
                />
              </div>
              <div>
                <Label>Priorité</Label>
                <Select value={priority} onValueChange={v => setPriority(v as typeof priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Information</SelectItem>
                    <SelectItem value="medium">Avertissement</SelectItem>
                    <SelectItem value="high">Important</SelectItem>
                    <SelectItem value="critical">Critique / Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>2. Destinataires</CardTitle>
            </CardHeader>
            <CardContent>
              <HSERecipientSelector
                employees={employees}
                onSelectionChange={setSelectedEmployees}
                preSelectedIds={selectedEmployees}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Documents */}
        <TabsContent value="document" className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>1. Document à partager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom du document</Label>
                <Input
                  placeholder="Ex: Procédure H2S mise à jour"
                  value={documentName}
                  onChange={e => setDocumentName(e.target.value)}
                />
              </div>
              <div>
                <Label>URL ou lien du document</Label>
                <Input
                  placeholder="https://... ou /documents/..."
                  value={documentUrl}
                  onChange={e => setDocumentUrl(e.target.value)}
                />
              </div>
              <div>
                <Label>Priorité</Label>
                <Select value={priority} onValueChange={v => setPriority(v as typeof priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Lecture recommandée</SelectItem>
                    <SelectItem value="medium">À lire</SelectItem>
                    <SelectItem value="high">Lecture obligatoire</SelectItem>
                    <SelectItem value="critical">Urgent - Action immédiate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>2. Destinataires</CardTitle>
            </CardHeader>
            <CardContent>
              <HSERecipientSelector
                employees={employees}
                onSelectionChange={setSelectedEmployees}
                preSelectedIds={selectedEmployees}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Parcours Certification */}
        <TabsContent value="certification" className="space-y-6">
          <Card className="industrial-card bg-purple-50/30 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-900">Parcours de Certification Intégrés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-purple-800">
                Les parcours combinent automatiquement{' '}
                <strong>Formation → Évaluation (après X jours) → Habilitation (si réussite)</strong>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-white rounded border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">ÉTAPE 1</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Formation assignée immédiatement</p>
                </div>

                <div className="p-3 bg-white rounded border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold">ÉTAPE 2</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Évaluation débloquée après délai</p>
                </div>

                <div className="p-3 bg-white rounded border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">ÉTAPE 3</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Habilitation accordée automatiquement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>1. Sélection du parcours</CardTitle>
            </CardHeader>
            <CardContent>
              <CertificationPathSelector
                selectedPathId={selectedCertificationPath}
                onSelect={setSelectedCertificationPath}
              />
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>2. Candidats (Internes et Externes)</CardTitle>
            </CardHeader>
            <CardContent>
              <CertificationCandidateSelector
                employees={employees}
                onSelectionChange={handleCandidateSelection}
                preSelectedIds={selectedCandidates}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200 gap-3">
            <div>
              <p className="font-semibold text-purple-900">Prêt à assigner le parcours complet</p>
              <p className="text-sm text-purple-700">
                {selectedCandidates.length > 0
                  ? `${selectedCandidates.length} candidat(s) • Formation + Évaluation (après délai) + Habilitation (si réussite)`
                  : 'Sélectionnez au moins un candidat (interne ou externe)'}
              </p>
              {selectedCandidates.length > 0 && (
                <p className="text-xs text-purple-600 mt-1">
                  {Object.values(candidateTypes).filter(t => t === 'employee').length} interne(s) •{' '}
                  {Object.values(candidateTypes).filter(t => t === 'external').length} externe(s)
                </p>
              )}
            </div>
            <Button
              onClick={handleAssignPath}
              disabled={!canSend || assigningPath}
              className="gap-2 bg-purple-600 hover:bg-purple-700 w-full md:w-auto"
            >
              {assigningPath ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Assignation...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  Assigner à {selectedCandidates.length}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Boutons d'action - Masqués pour l'onglet certification qui a son propre bouton */}
      {activeTab !== 'certification' && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-muted/30 rounded-lg border-2 border-dashed gap-3">
          <div>
            <p className="font-medium">Prêt à envoyer</p>
            <p className="text-sm text-muted-foreground">
              {selectedEmployees.length > 0
                ? `${selectedEmployees.length} destinataire${selectedEmployees.length > 1 ? 's' : ''} sélectionné${selectedEmployees.length > 1 ? 's' : ''}`
                : 'Sélectionnez des destinataires'}
            </p>
            {!canSend && selectedEmployees.length > 0 && (
              <p className="text-xs text-destructive mt-1">
                {activeTab === 'training' && !selectedTraining && 'Sélectionnez une formation'}
                {activeTab === 'alert' &&
                  (!alertTitle || !alertMessage) &&
                  'Remplissez le titre et le message'}
                {activeTab === 'document' &&
                  (!documentName || !documentUrl) &&
                  "Remplissez le nom et l'URL"}
              </p>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                console.log('👁️ Preview clicked', {
                  canSend,
                  selectedEmployees: selectedEmployees.length,
                })
                if (canSend) {
                  setShowPreview(true)
                }
              }}
              disabled={!canSend}
              className="flex-1 md:flex-none"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Prévisualiser
            </Button>
            <Button
              onClick={() => {
                console.log('📤 Envoyer clicked', { canSend })
                handleSend()
              }}
              disabled={!canSend}
              className="gap-2 flex-1 md:flex-none"
            >
              <Send className="w-4 h-4" />
              Envoyer à {selectedEmployees.length}
            </Button>
          </div>
        </div>
      )}

      {/* Dialog Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prévisualisation de l'envoi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type de contenu</Label>
              <Badge className="mt-1">
                {activeTab === 'training'
                  ? 'Formation'
                  : activeTab === 'alert'
                    ? 'Alerte/Information'
                    : 'Document'}
              </Badge>
            </div>

            {activeTab === 'training' &&
              selectedTraining &&
              (() => {
                const training = trainingModules.find(t => t.id === selectedTraining)
                return training ? (
                  <div>
                    <Label>Formation</Label>
                    <p className="text-sm font-medium mt-1">{training.title}</p>
                    <p className="text-xs text-muted-foreground">{training.code}</p>
                  </div>
                ) : null
              })()}

            {activeTab === 'alert' && (
              <>
                <div>
                  <Label>Titre</Label>
                  <p className="text-sm font-medium mt-1">{alertTitle}</p>
                </div>
                <div>
                  <Label>Message</Label>
                  <p className="text-sm text-muted-foreground mt-1">{alertMessage}</p>
                </div>
              </>
            )}

            {activeTab === 'document' && (
              <>
                <div>
                  <Label>Document</Label>
                  <p className="text-sm font-medium mt-1">{documentName}</p>
                </div>
                <div>
                  <Label>URL</Label>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{documentUrl}</p>
                </div>
              </>
            )}

            <div>
              <Label>Priorité</Label>
              <Badge
                className={
                  priority === 'critical'
                    ? 'bg-red-500'
                    : priority === 'high'
                      ? 'bg-orange-500'
                      : priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                }
              >
                {priority === 'critical'
                  ? 'Critique'
                  : priority === 'high'
                    ? 'Haute'
                    : priority === 'medium'
                      ? 'Moyenne'
                      : 'Basse'}
              </Badge>
            </div>

            <div>
              <Label>Destinataires ({selectedEmployees.length})</Label>
              <div className="max-h-32 overflow-y-auto border rounded p-2 mt-1">
                {selectedEmployees.map(id => {
                  const emp = employees.find(e => e.id === id)
                  return emp ? (
                    <div key={id} className="text-sm py-1">
                      {emp.firstName} {emp.lastName} ({emp.matricule}) - {emp.service}
                    </div>
                  ) : null
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Modifier
              </Button>
              <Button
                onClick={() => {
                  handleSend()
                  setShowPreview(false)
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmer l'envoi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
