import { useState } from 'react'
import { Calendar, Clock, MapPin, Users, Plus, X } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { HSETraining, HSETrainingSession, Employee } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { useHSETrainings } from '@/hooks/useHSETrainings'
import hseModulesData from '@/data/hse-training-modules.json'

interface HSESessionSchedulerProps {
  training: HSETraining
  onScheduled?: (session: HSETrainingSession) => void
  onCancel?: () => void
}

const instructors = [
  'Marie-Claire NZIEGE (Responsable HSE)',
  'Dr. NGOUA (Expert Chimie)',
  'Commandant ESSONO (Pompier)',
  'Jean-Pierre MOUKALA (Technicien HSE)',
  'Expert DEKRA (Formateur externe)',
  'Dr. MBADINGA (Médecin du travail)',
  'Formateur TOTAL E&P (Expert externe)',
]

const locations = [
  'Salle de formation A',
  'Salle de formation B',
  'Auditorium principal',
  'Centre de formation HSE',
  'Salle informatique',
  "Terrain d'exercice",
  'Zone de pratique EPI',
]

export function HSESessionScheduler({ training, onScheduled, onCancel }: HSESessionSchedulerProps) {
  const { state } = useApp()
  const { addSession } = useHSETrainings()

  const [formData, setFormData] = useState({
    date: '',
    time: '09:00',
    instructor: '',
    location: '',
    maxParticipants: 15,
    notes: '',
  })

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Obtenir les informations du module original
  const moduleInfo = hseModulesData.hseTrainingModules.find(m => m.title === training.title)

  // Filtrer les employés éligibles (ont les prérequis et le bon rôle)
  const eligibleEmployees = state.employees.filter(employee => {
    // Vérifier si l'employé a le bon rôle
    const hasRequiredRole = training.requiredForRoles.some(role => employee.roles.includes(role))
    if (!hasRequiredRole) return false

    // Vérifier les prérequis (simplifié pour la démo)
    // Dans un vrai système, on vérifierait si l'employé a complété toutes les formations prérequises

    return true
  })

  // Obtenir les employés qui ont besoin de cette formation
  const employeesNeedingTraining = eligibleEmployees.filter(employee => {
    // Vérifier si l'employé a déjà complété cette formation et si elle est encore valide
    const hasValidCertification = training.sessions.some(session =>
      session.attendance.some(
        att =>
          att.employeeId === employee.id &&
          att.status === 'completed' &&
          att.expirationDate &&
          att.expirationDate > new Date(),
      ),
    )

    return !hasValidCertification
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) newErrors.date = 'Date requise'
    if (!formData.instructor) newErrors.instructor = 'Instructeur requis'
    if (!formData.location) newErrors.location = 'Lieu requis'
    if (formData.maxParticipants < 1) newErrors.maxParticipants = 'Nombre de participants invalide'

    const selectedDate = new Date(`${formData.date}T${formData.time}`)
    if (selectedDate <= new Date()) {
      newErrors.date = 'La date doit être dans le futur'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const sessionDate = new Date(`${formData.date}T${formData.time}`)

      const newSession = await addSession(training.id, {
        trainingId: training.id,
        date: sessionDate,
        instructor: formData.instructor,
        location: formData.location,
        maxParticipants: formData.maxParticipants,
        status: 'scheduled',
      })

      if (newSession) {
        // Inscrire les employés sélectionnés
        // Note: Dans un vrai système, ceci serait fait via un appel API distinct
        console.log(
          `Session créée pour ${training.title} avec ${selectedEmployees.length} inscrits`,
        )

        onScheduled?.(newSession)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error)
    }
  }

  const handleEmployeeSelection = (employeeId: string, checked: boolean) => {
    if (checked) {
      if (selectedEmployees.length < formData.maxParticipants) {
        setSelectedEmployees(prev => [...prev, employeeId])
      }
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId))
    }
  }

  const selectEmployeesNeedingTraining = () => {
    const employeeIds = employeesNeedingTraining
      .slice(0, formData.maxParticipants)
      .map(emp => emp.id)
    setSelectedEmployees(employeeIds)
  }

  const clearSelection = () => {
    setSelectedEmployees([])
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Programmer une session - {training.title}
        </CardTitle>
        <p className="text-muted-foreground">{training.description}</p>
        {moduleInfo && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{moduleInfo.category}</Badge>
            <Badge variant="outline">{moduleInfo.duration}h</Badge>
            <Badge variant="outline">Validité: {training.validityMonths} mois</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date de la session *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={errors.date ? 'border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Heure de début *</Label>
              <Select
                value={formData.time}
                onValueChange={value => setFormData(prev => ({ ...prev, time: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">08:00</SelectItem>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="14:00">14:00</SelectItem>
                  <SelectItem value="15:00">15:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructor">Formateur *</Label>
              <Select
                value={formData.instructor}
                onValueChange={value => setFormData(prev => ({ ...prev, instructor: value }))}
              >
                <SelectTrigger className={errors.instructor ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un formateur" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map(instructor => (
                    <SelectItem key={instructor} value={instructor}>
                      {instructor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.instructor && <p className="text-sm text-red-500">{errors.instructor}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lieu *</Label>
              <Select
                value={formData.location}
                onValueChange={value => setFormData(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un lieu" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Nombre maximum de participants</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              max={moduleInfo?.maxParticipants || 25}
              value={formData.maxParticipants}
              onChange={e =>
                setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 1 }))
              }
              className={errors.maxParticipants ? 'border-red-500' : ''}
            />
            {moduleInfo && (
              <p className="text-xs text-muted-foreground">
                Maximum recommandé pour ce module: {moduleInfo.maxParticipants} participants
              </p>
            )}
            {errors.maxParticipants && (
              <p className="text-sm text-red-500">{errors.maxParticipants}</p>
            )}
          </div>

          {/* Sélection des participants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>
                Participants ({selectedEmployees.length}/{formData.maxParticipants})
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectEmployeesNeedingTraining}
                  disabled={employeesNeedingTraining.length === 0}
                >
                  Sélectionner les prioritaires ({employeesNeedingTraining.length})
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedEmployees.length === 0}
                >
                  Tout déselectionner
                </Button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eligibleEmployees.map(employee => {
                  const isSelected = selectedEmployees.includes(employee.id)
                  const needsTraining = employeesNeedingTraining.some(emp => emp.id === employee.id)
                  const isDisabled =
                    !isSelected && selectedEmployees.length >= formData.maxParticipants

                  return (
                    <div
                      key={employee.id}
                      className={`flex items-center space-x-3 p-2 rounded ${
                        needsTraining ? 'bg-yellow-50' : ''
                      } ${isDisabled ? 'opacity-50' : ''}`}
                    >
                      <Checkbox
                        id={employee.id}
                        checked={isSelected}
                        onCheckedChange={checked =>
                          handleEmployeeSelection(employee.id, checked as boolean)
                        }
                        disabled={isDisabled}
                      />
                      <Label htmlFor={employee.id} className="flex-1 cursor-pointer text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {employee.matricule} • {employee.service}
                            </div>
                          </div>
                          {needsTraining && (
                            <Badge variant="secondary" className="text-xs">
                              Prioritaire
                            </Badge>
                          )}
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            {eligibleEmployees.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p>Aucun employé éligible pour cette formation</p>
              </div>
            )}
          </div>

          {/* Notes additionnelles */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires sur la session..."
              className="min-h-[80px]"
            />
          </div>

          {/* Résumé de la session */}
          {formData.date && formData.instructor && formData.location && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 text-blue-900">Résumé de la session</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>
                      {new Date(`${formData.date}T${formData.time}`).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>
                      {formData.time} - {training.duration}min
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{formData.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{selectedEmployees.length} participant(s) inscrits</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="gap-2" disabled={selectedEmployees.length === 0}>
              <Plus className="w-4 h-4" />
              Programmer la session ({selectedEmployees.length} participants)
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
