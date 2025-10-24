import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  Plus,
  Eye,
  Edit,
  UserCheck,
  UserX,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ApprovalWorkflow {
  id: string
  type: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requester: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  approver: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  currentStep: number
  totalSteps: number
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface ApprovalStep {
  id: string
  stepNumber: number
  stepName: string
  approver: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  comments?: string
  approvedAt?: string
  dueDate?: string
  isRequired: boolean
  canDelegate: boolean
}

export function ApprovalWorkflowManager() {
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([])
  const [pendingSteps, setPendingSteps] = useState<ApprovalStep[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showStepDialog, setShowStepDialog] = useState(false)
  const [selectedStep, setSelectedStep] = useState<ApprovalStep | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null)

  // Formulaire de création
  const [createForm, setCreateForm] = useState({
    type: '',
    title: '',
    description: '',
    priority: 'medium',
    approvers: [] as Array<{
      stepName: string
      approverId: string
      dueDate: string
      isRequired: boolean
      canDelegate: boolean
    }>,
  })

  // Formulaire d'approbation
  const [approvalForm, setApprovalForm] = useState({
    decision: 'approved',
    comments: '',
  })

  useEffect(() => {
    fetchWorkflows()
    fetchPendingSteps()
  }, [])

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/approval/workflows')

      // Check if response is HTML (404 page) instead of JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API non disponible, utilisation de données de démonstration')
        // Use mock data when API is not available
        setWorkflows([
          {
            id: '1',
            name: 'Validation HSE',
            description: 'Workflow de validation des incidents HSE',
            steps: [
              { id: '1', name: 'Signalement', status: 'completed', assignee: 'HSE001' },
              { id: '2', name: 'Analyse', status: 'in_progress', assignee: 'HSE001' },
              { id: '3', name: 'Validation', status: 'pending', assignee: 'DG001' },
            ],
            status: 'in_progress',
            createdAt: new Date().toISOString(),
          },
        ])
        return
      }

      const data = await response.json()
      if (data.success) {
        setWorkflows(data.data)
      }
    } catch (error) {
      console.error('Erreur récupération workflows:', error)
      // Set mock data on error
      setWorkflows([
        {
          id: '1',
          name: 'Validation HSE',
          description: 'Workflow de validation des incidents HSE',
          steps: [
            { id: '1', name: 'Signalement', status: 'completed', assignee: 'HSE001' },
            { id: '2', name: 'Analyse', status: 'in_progress', assignee: 'HSE001' },
            { id: '3', name: 'Validation', status: 'pending', assignee: 'DG001' },
          ],
          status: 'in_progress',
          createdAt: new Date().toISOString(),
        },
      ])
    }
  }

  const fetchPendingSteps = async () => {
    try {
      const response = await fetch('/api/approval/pending')

      // Check if response is HTML (404 page) instead of JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API non disponible, utilisation de données de démonstration')
        // Use mock data when API is not available
        setPendingSteps([
          {
            id: '1',
            workflowId: '1',
            stepName: 'Analyse HSE',
            assignee: 'HSE001',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            description: "Analyser l'incident HSE signalé",
          },
        ])
        return
      }

      const data = await response.json()
      if (data.success) {
        setPendingSteps(data.data)
      }
    } catch (error) {
      console.error('Erreur récupération étapes en attente:', error)
      // Set mock data on error
      setPendingSteps([
        {
          id: '1',
          workflowId: '1',
          stepName: 'Analyse HSE',
          assignee: 'HSE001',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          description: "Analyser l'incident HSE signalé",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async () => {
    try {
      const response = await fetch('/api/approval/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Succès',
          description: 'Workflow créé avec succès',
        })
        setShowCreateDialog(false)
        setCreateForm({
          type: '',
          title: '',
          description: '',
          priority: 'medium',
          approvers: [],
        })
        fetchWorkflows()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Erreur création workflow:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le workflow',
        variant: 'destructive',
      })
    }
  }

  const handleApproveStep = async () => {
    if (!selectedStep) return

    try {
      const response = await fetch(`/api/approval/step/${selectedStep.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalForm),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Succès',
          description: `Étape ${approvalForm.decision === 'approved' ? 'approuvée' : 'rejetée'} avec succès`,
        })
        setShowStepDialog(false)
        setSelectedStep(null)
        setApprovalForm({ decision: 'approved', comments: '' })
        fetchPendingSteps()
        fetchWorkflows()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Erreur approbation étape:', error)
      toast({
        title: 'Erreur',
        description: "Impossible de traiter l'approbation",
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <ArrowRight className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Workflows d'Approbation</h2>
          <p className="text-muted-foreground">Workflows HSE et hiérarchie d'approbation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Workflow
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">En Attente ({pendingSteps.length})</TabsTrigger>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
        </TabsList>

        {/* En Attente */}
        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {pendingSteps.map(step => (
              <Card key={step.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{step.stepName}</h3>
                        <Badge className={getStatusColor(step.status)}>
                          {step.status === 'pending'
                            ? 'En attente'
                            : step.status === 'approved'
                              ? 'Approuvé'
                              : step.status === 'rejected'
                                ? 'Rejeté'
                                : 'Ignoré'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Approbateur:</strong> {step.approver.firstName}{' '}
                        {step.approver.lastName}
                      </p>
                      {step.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Échéance:</strong> {new Date(step.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStep(step)
                          setShowStepDialog(true)
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Traiter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Actifs */}
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {workflows
              .filter(w => w.status === 'in_progress')
              .map(workflow => (
                <Card key={workflow.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{workflow.title}</h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status === 'in_progress' ? 'En cours' : workflow.status}
                          </Badge>
                          <Badge className={getPriorityColor(workflow.priority)}>
                            {workflow.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Demandeur:</strong> {workflow.requester.firstName}{' '}
                          {workflow.requester.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Étape:</strong> {workflow.currentStep}/{workflow.totalSteps}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Terminés */}
        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {workflows
              .filter(w => w.status === 'approved' || w.status === 'rejected')
              .map(workflow => (
                <Card key={workflow.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{workflow.title}</h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Demandeur:</strong> {workflow.requester.firstName}{' '}
                          {workflow.requester.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Terminé le:</strong>{' '}
                          {new Date(workflow.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Tous */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {workflows.map(workflow => (
              <Card key={workflow.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{workflow.title}</h3>
                        <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                        <Badge className={getPriorityColor(workflow.priority)}>
                          {workflow.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Demandeur:</strong> {workflow.requester.firstName}{' '}
                        {workflow.requester.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Type:</strong> {workflow.type} | <strong>Étape:</strong>{' '}
                        {workflow.currentStep}/{workflow.totalSteps}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un Workflow d'Approbation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={createForm.type}
                  onValueChange={value => setCreateForm({ ...createForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hse_incident">Incident HSE</SelectItem>
                    <SelectItem value="training_approval">Approbation Formation</SelectItem>
                    <SelectItem value="equipment_purchase">Achat Équipement</SelectItem>
                    <SelectItem value="policy_change">Changement de Politique</SelectItem>
                    <SelectItem value="audit_plan">Plan d'Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={createForm.priority}
                  onValueChange={value => setCreateForm({ ...createForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="Titre du workflow"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Description du workflow"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateWorkflow}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'approbation */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traiter l'Approbation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="decision">Décision</Label>
              <Select
                value={approvalForm.decision}
                onValueChange={value => setApprovalForm({ ...approvalForm, decision: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approuver</SelectItem>
                  <SelectItem value="rejected">Rejeter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                value={approvalForm.comments}
                onChange={e => setApprovalForm({ ...approvalForm, comments: e.target.value })}
                placeholder="Commentaires sur la décision"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStepDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleApproveStep}>
              {approvalForm.decision === 'approved' ? 'Approuver' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
