import { useState } from 'react'
import { AlertTriangle, Camera, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { HSEIncident } from '@/types'
import { useApp } from '@/contexts/AppContext'

interface HSEIncidentFormProps {
  incident?: HSEIncident
  onSubmit: (incident: Partial<HSEIncident>) => void
  onCancel: () => void
}

const incidentTypes = [
  'Chute de plain-pied',
  'Chute de hauteur',
  'Blessure par objet tranchant',
  'Brûlure',
  'Exposition chimique',
  'EPI manquant ou défaillant',
  'Incident environnemental',
  'Quasi-accident',
  'Autre',
]

const locations = [
  'Zone production',
  'Entrée site',
  'Bureau administratif',
  'Atelier maintenance',
  'Zone stockage',
  'Laboratoire',
  'Parking',
  'Cantine',
  'Autre',
]

export function HSEIncidentForm({ incident, onSubmit, onCancel }: HSEIncidentFormProps) {
  const { state } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: incident?.employeeId || '',
    type: incident?.type || '',
    severity: incident?.severity || ('low' as const),
    description: incident?.description || '',
    location: incident?.location || '',
    occurredAt: incident?.occurredAt
      ? incident.occurredAt.toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    reportedBy:
      incident?.reportedBy ||
      state.currentUser?.firstName + ' ' + state.currentUser?.lastName ||
      '',
    attachments: incident?.attachments || [],
  })

  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId) newErrors.employeeId = 'Employé requis'
    if (!formData.type) newErrors.type = "Type d'incident requis"
    if (!formData.description.trim()) newErrors.description = 'Description requise'
    if (!formData.location) newErrors.location = 'Localisation requise'
    if (!formData.reportedBy.trim()) newErrors.reportedBy = 'Nom du déclarant requis'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || isSubmitting) return

    try {
      setIsSubmitting(true)
      setErrors({})

      // Convertir les fichiers en URLs de données (simulation)
      const attachmentUrls = attachmentFiles.map(file => URL.createObjectURL(file))

      const incidentData: Partial<HSEIncident> = {
        ...formData,
        occurredAt: new Date(formData.occurredAt),
        attachments: [...formData.attachments, ...attachmentUrls],
      }

      await onSubmit(incidentData)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      setErrors({ submit: 'Erreur lors de la soumission du formulaire' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setAttachmentFiles(prev => [...prev, ...files])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index))
  }

  const severityConfig = {
    low: { label: 'Faible', color: 'bg-blue-100 text-blue-800' },
    medium: { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'Élevé', color: 'bg-red-100 text-red-800' },
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          {incident ? "Modifier l'incident" : 'Déclarer un incident HSE'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employé concerné *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={value => {
                  setFormData(prev => ({ ...prev, employeeId: value }))
                  // Effacer l'erreur si l'utilisateur corrige
                  if (errors.employeeId) {
                    setErrors(prev => ({ ...prev, employeeId: '' }))
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.employeeId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {state.employees.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      Aucun employé disponible
                    </SelectItem>
                  ) : (
                    state.employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} ({employee.matricule})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type d'incident *</Label>
              <Select
                value={formData.type}
                onValueChange={value => {
                  setFormData(prev => ({ ...prev, type: value }))
                  if (errors.type) {
                    setErrors(prev => ({ ...prev, type: '' }))
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
            </div>
          </div>

          {/* Sévérité */}
          <div className="space-y-3">
            <Label>Sévérité *</Label>
            <RadioGroup
              value={formData.severity}
              onValueChange={(value: 'low' | 'medium' | 'high') =>
                setFormData(prev => ({ ...prev, severity: value }))
              }
              className="flex space-x-6"
            >
              {Object.entries(severityConfig).map(([value, config]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`severity-${value}`} />
                  <Label htmlFor={`severity-${value}`} className="cursor-pointer">
                    <Badge className={config.color}>{config.label}</Badge>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Localisation et Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localisation *</Label>
              <Select
                value={formData.location}
                onValueChange={value => setFormData(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner le lieu" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="occurredAt">Date et heure de l'incident *</Label>
              <Input
                id="occurredAt"
                type="datetime-local"
                value={formData.occurredAt}
                onChange={e => setFormData(prev => ({ ...prev, occurredAt: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => {
                setFormData(prev => ({ ...prev, description: e.target.value }))
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: '' }))
                }
              }}
              placeholder="Décrivez les circonstances de l'incident, les personnes impliquées, les conséquences..."
              className={`min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Déclarant */}
          <div className="space-y-2">
            <Label htmlFor="reportedBy">Déclaré par *</Label>
            <Input
              id="reportedBy"
              value={formData.reportedBy}
              onChange={e => setFormData(prev => ({ ...prev, reportedBy: e.target.value }))}
              placeholder="Nom et prénom du déclarant"
              className={errors.reportedBy ? 'border-red-500' : ''}
            />
            {errors.reportedBy && <p className="text-sm text-red-500">{errors.reportedBy}</p>}
          </div>

          {/* Pièces jointes */}
          <div className="space-y-3">
            <Label>Pièces jointes (photos, documents)</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <Camera className="w-4 h-4" />
                Ajouter des fichiers
              </Button>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {attachmentFiles.length > 0 && (
              <div className="space-y-2">
                {attachmentFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {isSubmitting
                ? 'Enregistrement...'
                : incident
                  ? 'Mettre à jour'
                  : "Déclarer l'incident"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
