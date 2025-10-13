import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileUpload } from '@/components/upload/FileUpload'
import { Employee, UserRole } from '@/types'
import { User, Save, X, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// Schéma de validation Zod
const employeeFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),

  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),

  matricule: z
    .string()
    .regex(
      /^[A-Z]{3}\d{3}$/,
      'Le matricule doit suivre le format XXX000 (3 lettres majuscules + 3 chiffres)',
    ),

  service: z
    .string()
    .min(2, 'Le service doit contenir au moins 2 caractères')
    .max(100, 'Le service ne peut pas dépasser 100 caractères'),

  roles: z
    .array(z.enum(['ADMIN', 'HSE', 'SUPERVISEUR', 'RECEP', 'EMPLOYE', 'COMMUNICATION']))
    .min(1, 'Au moins un rôle est requis'),

  email: z.string().email('Adresse email invalide').optional().or(z.literal('')),

  phone: z
    .string()
    .regex(/^[0-9+\-() ]*$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),

  status: z.enum(['active', 'inactive']).default('active'),
})

type EmployeeFormData = z.infer<typeof employeeFormSchema>

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: (
    data: EmployeeFormData & {
      competences: string[]
      habilitations: string[]
      photo?: string
    },
  ) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

// Rôles disponibles avec descriptions
const AVAILABLE_ROLES = [
  {
    value: 'ADMIN' as const,
    label: 'Administrateur',
    description: 'Accès complet à tous les modules',
    color: 'bg-destructive text-destructive-foreground',
  },
  {
    value: 'HSE' as const,
    label: 'Responsable HSE',
    description: 'Gestion sécurité, incidents et formations',
    color: 'bg-orange-500 text-white',
  },
  {
    value: 'SUPERVISEUR' as const,
    label: 'Superviseur',
    description: 'Supervision équipes et équipements',
    color: 'bg-blue-500 text-white',
  },
  {
    value: 'RECEP' as const,
    label: 'Réceptionniste',
    description: 'Accueil visiteurs et gestion colis',
    color: 'bg-green-500 text-white',
  },
  {
    value: 'COMMUNICATION' as const,
    label: 'Communication',
    description: 'Gestion contenu et événements',
    color: 'bg-purple-500 text-white',
  },
  {
    value: 'EMPLOYE' as const,
    label: 'Employé',
    description: 'Accès employé standard',
    color: 'bg-gray-500 text-white',
  },
]

// Services disponibles
const AVAILABLE_SERVICES = [
  'Direction',
  'Production',
  'HSE',
  'Accueil',
  'Communication',
  'Maintenance',
  'Qualité',
  'Logistique',
  'Ressources Humaines',
  'Informatique',
]

export function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
  isLoading = false,
}: EmployeeFormProps) {
  const [competences, setCompetences] = useState<string[]>(employee?.competences || [])
  const [habilitations, setHabilitations] = useState<string[]>(employee?.habilitations || [])
  const [newCompetence, setNewCompetence] = useState('')
  const [newHabilitation, setNewHabilitation] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(employee?.photo)

  // Configuration du formulaire React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      matricule: employee?.matricule || '',
      service: employee?.service || '',
      roles: employee?.roles || ['EMPLOYE'],
      email: employee?.email || '',
      phone: employee?.phone || '',
      status: employee?.status || 'active',
    },
  })

  const watchedRoles = watch('roles', [])

  // Réinitialiser le formulaire si l'employé change
  useEffect(() => {
    if (employee) {
      reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        matricule: employee.matricule,
        service: employee.service,
        roles: employee.roles,
        email: employee.email || '',
        phone: employee.phone || '',
        status: employee.status,
      })
      setCompetences(employee.competences || [])
      setHabilitations(employee.habilitations || [])
      setPhotoUrl(employee.photo)
    }
  }, [employee, reset])

  // Gestion de la soumission
  const onFormSubmit = async (data: EmployeeFormData) => {
    try {
      await onSubmit({
        ...data,
        competences,
        habilitations,
        photo: photoUrl,
      })
    } catch (error) {
      console.error('Erreur soumission formulaire:', error)
    }
  }

  // Ajouter une compétence
  const addCompetence = () => {
    if (newCompetence.trim() && !competences.includes(newCompetence.trim())) {
      setCompetences([...competences, newCompetence.trim()])
      setNewCompetence('')
    }
  }

  // Supprimer une compétence
  const removeCompetence = (index: number) => {
    setCompetences(competences.filter((_, i) => i !== index))
  }

  // Ajouter une habilitation
  const addHabilitation = () => {
    if (newHabilitation.trim() && !habilitations.includes(newHabilitation.trim())) {
      setHabilitations([...habilitations, newHabilitation.trim()])
      setNewHabilitation('')
    }
  }

  // Supprimer une habilitation
  const removeHabilitation = (index: number) => {
    setHabilitations(habilitations.filter((_, i) => i !== index))
  }

  // Gérer l'upload de photo
  const handlePhotoUpload = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    // Simuler l'upload (en production, utiliser l'API)
    const file = files[0]
    const url = URL.createObjectURL(file)
    setPhotoUrl(url)

    toast({
      title: 'Photo uploadée',
      description: 'La photo de profil a été mise à jour',
    })

    return [url]
  }

  // Basculer la sélection d'un rôle
  const toggleRole = (role: UserRole) => {
    const currentRoles = watchedRoles
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role]

    // S'assurer qu'au moins un rôle est sélectionné
    if (newRoles.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Au moins un rôle doit être sélectionné',
        variant: 'destructive',
      })
      return
    }

    setValue('roles', newRoles)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {employee ? "Modifier l'employé" : 'Nouvel employé'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations personnelles</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input id="firstName" {...register('firstName')} placeholder="Entrez le prénom" />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input id="lastName" {...register('lastName')} placeholder="Entrez le nom" />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule *</Label>
                <Input
                  id="matricule"
                  {...register('matricule')}
                  placeholder="XXX000"
                  className="font-mono"
                  disabled={!!employee} // Ne pas permettre la modification du matricule
                />
                {errors.matricule && (
                  <p className="text-sm text-destructive">{errors.matricule.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service *</Label>
                <Controller
                  control={control}
                  name="service"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Sélectionnez un service</option>
                      {AVAILABLE_SERVICES.map(service => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.service && (
                  <p className="text-sm text-destructive">{errors.service.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="prenom.nom@sogara.com"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" {...register('phone')} placeholder="+221 XX XXX XX XX" />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Rôles et permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Rôles et permissions</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_ROLES.map(roleOption => (
                <div
                  key={roleOption.value}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    watchedRoles.includes(roleOption.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/30'
                  }`}
                  onClick={() => toggleRole(roleOption.value)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={watchedRoles.includes(roleOption.value)}
                      onChange={() => toggleRole(roleOption.value)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={roleOption.color}>{roleOption.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{roleOption.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.roles && <p className="text-sm text-destructive">{errors.roles.message}</p>}
          </div>

          <Separator />

          {/* Compétences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Compétences</h3>

            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une compétence"
                value={newCompetence}
                onChange={e => setNewCompetence(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCompetence())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCompetence}
                disabled={!newCompetence.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {competences.map((competence, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeCompetence(index)}
                >
                  {competence}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Habilitations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Habilitations</h3>

            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une habilitation"
                value={newHabilitation}
                onChange={e => setNewHabilitation(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addHabilitation())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addHabilitation}
                disabled={!newHabilitation.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {habilitations.map((habilitation, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeHabilitation(index)}
                >
                  {habilitation}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Photo de profil */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Photo de profil</h3>

            {photoUrl && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={photoUrl}
                  alt="Photo de profil"
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPhotoUrl(undefined)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            )}

            <FileUpload
              accept="image/*"
              multiple={false}
              maxSize={5 * 1024 * 1024} // 5MB
              onUpload={handlePhotoUpload}
              title="Photo de profil"
              description="Déposez une image ou cliquez pour sélectionner"
              showPreview={true}
            />
          </div>

          <Separator />

          {/* Statut */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Statut</h3>

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="active"
                      checked={field.value === 'active'}
                      onChange={() => field.onChange('active')}
                      className="text-primary"
                    />
                    <Badge variant="default">Actif</Badge>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="inactive"
                      checked={field.value === 'inactive'}
                      onChange={() => field.onChange('inactive')}
                      className="text-primary"
                    />
                    <Badge variant="secondary">Inactif</Badge>
                  </label>
                </div>
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>

            <Button type="submit" disabled={isSubmitting || isLoading} className="gap-2">
              <Save className="w-4 h-4" />
              {employee ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
