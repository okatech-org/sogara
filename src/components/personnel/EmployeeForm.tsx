import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, AlertCircle } from 'lucide-react'
import { Employee } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface EmployeeFormData {
  firstName: string
  lastName: string
  matricule: string
  email: string
  phone: string
  service: string
  roles: string[]
  competences: string[]
  habilitations: string[]
  status: 'active' | 'inactive'
}

interface EmployeeFormProps {
  employee?: Employee | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EmployeeFormData) => Promise<void>
  loading?: boolean
}

const availableRoles = ['ADMIN', 'HSE', 'SUPERVISEUR', 'RECEP', 'EMPLOYE', 'DG', 'DRH']
const availableServices = ['Production', 'HSE', 'Administration', 'RH', 'IT', 'Maintenance', 'Qualité']
const availableCompetences = ['Gestion', 'Sécurité', 'Maintenance', 'Qualité', 'Formation', 'Supervision']
const availableHabilitations = ['Chauffeur', 'Grutier', 'Soudeur', 'Électricien', 'Formateur', 'Auditeur']

export function EmployeeForm({ employee, isOpen, onClose, onSubmit, loading = false }: EmployeeFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    matricule: '',
    email: '',
    phone: '',
    service: '',
    roles: [],
    competences: [],
    habilitations: [],
    status: 'active'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialiser le formulaire avec les données de l'employé
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        matricule: employee.matricule || '',
        email: employee.email || '',
        phone: employee.phone || '',
        service: employee.service || '',
        roles: employee.roles || [],
        competences: employee.competences || [],
        habilitations: employee.habilitations || [],
        status: employee.status || 'active'
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        matricule: '',
        email: '',
        phone: '',
        service: '',
        roles: [],
        competences: [],
        habilitations: [],
        status: 'active'
      })
    }
    setErrors({})
  }, [employee, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }
    if (!formData.matricule.trim()) {
      newErrors.matricule = 'Le matricule est requis'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }
    if (!formData.service) {
      newErrors.service = 'Le service est requis'
    }
    if (formData.roles.length === 0) {
      newErrors.roles = 'Au moins un rôle est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArrayChange = (field: 'roles' | 'competences' | 'habilitations', value: string, action: 'add' | 'remove') => {
    setFormData(prev => ({
      ...prev,
      [field]: action === 'add' 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }))
  }

  const addToArray = (field: 'roles' | 'competences' | 'habilitations', value: string) => {
    if (value && !formData[field].includes(value)) {
      handleArrayChange(field, value, 'add')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {employee ? 'Modifier l\'employé' : 'Nouvel employé'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="matricule">Matricule *</Label>
                  <Input
                    id="matricule"
                    value={formData.matricule}
                    onChange={(e) => setFormData(prev => ({ ...prev, matricule: e.target.value.toUpperCase() }))}
                    className={errors.matricule ? 'border-red-500' : ''}
                  />
                  {errors.matricule && (
                    <p className="text-sm text-red-500 mt-1">{errors.matricule}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="service">Service *</Label>
                  <Select value={formData.service} onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}>
                    <SelectTrigger className={errors.service ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServices.map(service => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.service && (
                    <p className="text-sm text-red-500 mt-1">{errors.service}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Rôles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rôles *</h3>
              <div className="flex flex-wrap gap-2">
                {formData.roles.map(role => (
                  <Badge key={role} variant="secondary" className="flex items-center gap-1">
                    {role}
                    <button
                      type="button"
                      onClick={() => handleArrayChange('roles', role, 'remove')}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(value) => addToArray('roles', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles
                    .filter(role => !formData.roles.includes(role))
                    .map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.roles && (
                <p className="text-sm text-red-500">{errors.roles}</p>
              )}
            </div>

            {/* Compétences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {formData.competences.map(competence => (
                  <Badge key={competence} variant="outline" className="flex items-center gap-1">
                    {competence}
                    <button
                      type="button"
                      onClick={() => handleArrayChange('competences', competence, 'remove')}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(value) => addToArray('competences', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter une compétence" />
                </SelectTrigger>
                <SelectContent>
                  {availableCompetences
                    .filter(competence => !formData.competences.includes(competence))
                    .map(competence => (
                      <SelectItem key={competence} value={competence}>{competence}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Habilitations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Habilitations</h3>
              <div className="flex flex-wrap gap-2">
                {formData.habilitations.map(habilitation => (
                  <Badge key={habilitation} variant="outline" className="flex items-center gap-1">
                    {habilitation}
                    <button
                      type="button"
                      onClick={() => handleArrayChange('habilitations', habilitation, 'remove')}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(value) => addToArray('habilitations', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter une habilitation" />
                </SelectTrigger>
                <SelectContent>
                  {availableHabilitations
                    .filter(habilitation => !formData.habilitations.includes(habilitation))
                    .map(habilitation => (
                      <SelectItem key={habilitation} value={habilitation}>{habilitation}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || loading}
                className="gradient-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  employee ? 'Modifier' : 'Créer'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
