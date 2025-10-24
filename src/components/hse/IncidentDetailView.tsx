import React, { useState } from 'react'
import { HSEIncident } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, CheckCircle, Upload, FileText, ThumbsUp } from 'lucide-react'

interface IncidentDetailViewProps {
  incident: HSEIncident
  onClose: () => void
  isHSE02: boolean
  onUpdate?: (incident: HSEIncident) => void
}

export default function IncidentDetailView({
  incident,
  onClose,
  isHSE02,
  onUpdate,
}: IncidentDetailViewProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalComment, setApprovalComment] = useState('')

  const canApprove =
    isHSE02 && incident.approvalStatus === 'pending' && ['low', 'medium'].includes(incident.severity)
  const canEscalate = isHSE02 && ['high', 'critical'].includes(incident.severity)

  const handleApprove = async () => {
    if (!approvalComment.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez ajouter un commentaire',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/hse/incidents/${incident.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          comment: approvalComment,
          approvalStatus: 'approved_hse002',
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        onUpdate?.(updated.data)
        toast({
          title: 'Succès',
          description: 'Incident approuvé avec succès',
        })
        setShowApprovalDialog(false)
        onClose()
      } else {
        throw new Error('Erreur lors de l\'approbation')
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEscalate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/hse/incidents/${incident.id}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        const updated = await response.json()
        onUpdate?.(updated.data)
        toast({
          title: 'Succès',
          description: 'Incident escaladé vers HSE001',
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'escalade',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      reported: 'bg-blue-100 text-blue-800',
      investigating: 'bg-purple-100 text-purple-800',
      action_required: 'bg-orange-100 text-orange-800',
      monitoring: 'bg-green-100 text-green-800',
      resolved: 'bg-teal-100 text-teal-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'destructive',
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    }
    return colors[severity] || 'default'
  }

  return (
    <div className="space-y-6 p-6 max-h-96 overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{incident.title}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Sévérité</p>
            <Badge className={getSeverityColor(incident.severity)}>
              {incident.severity.toUpperCase()}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Statut</p>
            <Badge className={getStatusColor(incident.status)}>
              {incident.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Localisation</p>
            <p className="font-semibold">{incident.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-semibold">
              {new Date(incident.occurredAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-gray-700 bg-gray-50 p-3 rounded">{incident.description}</p>
      </div>

      {/* Root Cause */}
      {incident.rootCause && (
        <div>
          <h3 className="font-semibold mb-2">Cause Racine</h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded">{incident.rootCause}</p>
        </div>
      )}

      {/* Corrective Actions */}
      {incident.correctiveActions && incident.correctiveActions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Actions Correctives</h3>
          <div className="space-y-2">
            {incident.correctiveActions.map((action, idx) => (
              <Card key={idx} className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{action.action}</p>
                    <p className="text-sm text-gray-600">Responsable: {action.assignedTo}</p>
                    <p className="text-sm text-gray-600">
                      Échéance: {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge
                    className={
                      action.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : action.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {action.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approval Section */}
      {canApprove && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Approbation Requise</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            Cet incident de sévérité {incident.severity} nécessite votre approbation avant traitement.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowApprovalDialog(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approuver
            </Button>
            {canEscalate && (
              <Button
                variant="outline"
                onClick={handleEscalate}
                disabled={loading}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Escalader à HSE001
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approuver l'Incident</DialogTitle>
              <DialogDescription>
                Veuillez ajouter un commentaire avant d'approuver cet incident.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Commentaire sur l'approbation..."
                value={approvalComment}
                onChange={e => setApprovalComment(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading || !approvalComment.trim()}
              >
                {loading ? 'Approbation...' : 'Approuver'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Close Button */}
      <Button variant="outline" onClick={onClose} className="w-full">
        Fermer
      </Button>
    </div>
  )
}