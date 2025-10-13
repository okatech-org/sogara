import { useState } from 'react'
import {
  BookOpen,
  Clock,
  Users,
  Award,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { HSETraining, UserRole } from '@/types'
import { StatusBadge } from '@/components/ui/status-badge'
import hseModulesData from '@/data/hse-training-modules.json'

interface HSETrainingCatalogProps {
  trainings: HSETraining[]
  onScheduleSession?: (trainingId: string) => void
  canManage?: boolean
}

interface TrainingModule {
  id: string
  code: string
  title: string
  category: string
  description: string
  objectives: string[]
  duration: number
  validityMonths: number
  requiredForRoles: UserRole[]
  prerequisites: string[]
  certification: {
    examRequired: boolean
    passingScore: number | null
    practicalTest: boolean
    certificateType: string
  }
  instructor: {
    qualificationRequired: string
    minExperience: string
  }
  maxParticipants: number
  deliveryMethods: string[]
  refresherRequired: boolean
  refresherFrequency: number
}

export function HSETrainingCatalog({
  trainings,
  onScheduleSession,
  canManage = false,
}: HSETrainingCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedTraining, setSelectedTraining] = useState<TrainingModule | null>(null)

  const trainingModules = hseModulesData.hseTrainingModules as TrainingModule[]

  // Filtrer les modules
  const filteredModules = trainingModules.filter(module => {
    const matchesSearch =
      searchTerm === '' ||
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory

    const matchesRole =
      selectedRole === 'all' || module.requiredForRoles.includes(selectedRole as UserRole)

    return matchesSearch && matchesCategory && matchesRole
  })

  // Obtenir les catégories uniques
  const categories = [...new Set(trainingModules.map(m => m.category))]

  // Obtenir les rôles uniques
  const roles: UserRole[] = ['EMPLOYE', 'SUPERVISEUR', 'HSE', 'ADMIN']

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Critique':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Obligatoire':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Spécialisée':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Management':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Prévention':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${hours * 60} min`
    if (hours === 1) return '1 heure'
    return `${hours} heures`
  }

  const hasUpcomingSessions = (moduleTitle: string) => {
    const training = trainings.find(t => t.title === moduleTitle)
    return training?.sessions.some(s => s.status === 'scheduled' && s.date > new Date()) || false
  }

  const getTrainingStats = (moduleTitle: string) => {
    const training = trainings.find(t => t.title === moduleTitle)
    if (!training) return { sessions: 0, participants: 0 }

    const sessions = training.sessions.length
    const participants = training.sessions.reduce((sum, s) => sum + s.attendance.length, 0)

    return { sessions, participants }
  }

  const renderModuleCard = (module: TrainingModule) => {
    const stats = getTrainingStats(module.title)
    const hasUpcoming = hasUpcomingSessions(module.title)

    return (
      <Card
        key={module.id}
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setSelectedTraining(module)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(module.category)}>{module.category}</Badge>
                <Badge variant="outline" className="text-xs">
                  {module.code}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{module.title}</CardTitle>
            </div>

            {hasUpcoming && <StatusBadge status="Programmé" variant="info" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {module.description}
          </p>

          {/* Informations clés */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{formatDuration(module.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              <span>Max {module.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span>{module.validityMonths} mois</span>
            </div>
            <div className="flex items-center gap-2">
              {module.certification.examRequired ? (
                <CheckCircle className="w-4 h-4 text-orange-500" />
              ) : (
                <BookOpen className="w-4 h-4 text-gray-500" />
              )}
              <span>{module.certification.examRequired ? 'Examen requis' : 'Attestation'}</span>
            </div>
          </div>

          {/* Rôles concernés */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Rôles concernés:</p>
            <div className="flex flex-wrap gap-1">
              {module.requiredForRoles.map(role => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Prérequis */}
          {module.prerequisites.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Prérequis:</p>
              <div className="flex flex-wrap gap-1">
                {module.prerequisites.map(prereq => {
                  const prereqModule = trainingModules.find(m => m.id === prereq)
                  return (
                    <Badge key={prereq} variant="outline" className="text-xs">
                      {prereqModule?.code || prereq}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Statistiques */}
          {(stats.sessions > 0 || stats.participants > 0) && (
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stats.sessions} session(s)</span>
                <span>{stats.participants} participant(s)</span>
              </div>
            </div>
          )}

          {/* Actions */}
          {canManage && (
            <div className="pt-3 border-t border-border">
              <Button
                size="sm"
                className="w-full"
                onClick={e => {
                  e.stopPropagation()
                  onScheduleSession?.(module.id)
                }}
              >
                Programmer une session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderTrainingDetails = (module: TrainingModule) => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(module.category)}>{module.category}</Badge>
              <Badge variant="outline">{module.code}</Badge>
            </div>
            <h2 className="text-2xl font-bold">{module.title}</h2>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">{module.description}</p>
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Durée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(module.duration)}</div>
            <p className="text-sm text-muted-foreground">Formation complète</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4" />
              Validité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{module.validityMonths}</div>
            <p className="text-sm text-muted-foreground">mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{module.maxParticipants}</div>
            <p className="text-sm text-muted-foreground">maximum</p>
          </CardContent>
        </Card>
      </div>

      {/* Objectifs pédagogiques */}
      <Card>
        <CardHeader>
          <CardTitle>Objectifs pédagogiques</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {module.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Rôles et prérequis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rôles concernés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {module.requiredForRoles.map(role => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prérequis</CardTitle>
          </CardHeader>
          <CardContent>
            {module.prerequisites.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun prérequis</p>
            ) : (
              <div className="space-y-2">
                {module.prerequisites.map(prereq => {
                  const prereqModule = trainingModules.find(m => m.id === prereq)
                  return (
                    <div key={prereq} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>{prereqModule?.title || prereq}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certification */}
      <Card>
        <CardHeader>
          <CardTitle>Certification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Type de certificat:</span>
              <p className="text-muted-foreground mt-1">{module.certification.certificateType}</p>
            </div>

            <div>
              <span className="font-medium">Examen requis:</span>
              <div className="flex items-center gap-2 mt-1">
                {module.certification.examRequired ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <span className="w-4 h-4" />
                )}
                <span className="text-muted-foreground">
                  {module.certification.examRequired ? 'Oui' : 'Non'}
                </span>
              </div>
            </div>

            {module.certification.passingScore && (
              <div>
                <span className="font-medium">Note de passage:</span>
                <p className="text-muted-foreground mt-1">{module.certification.passingScore}%</p>
              </div>
            )}

            <div>
              <span className="font-medium">Test pratique:</span>
              <div className="flex items-center gap-2 mt-1">
                {module.certification.practicalTest ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <span className="w-4 h-4" />
                )}
                <span className="text-muted-foreground">
                  {module.certification.practicalTest ? 'Oui' : 'Non'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations formateur */}
      <Card>
        <CardHeader>
          <CardTitle>Formateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Qualification requise:</span>
              <p className="text-muted-foreground mt-1">
                {module.instructor.qualificationRequired}
              </p>
            </div>
            <div>
              <span className="font-medium">Expérience minimale:</span>
              <p className="text-muted-foreground mt-1">{module.instructor.minExperience}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modalités de formation */}
      <Card>
        <CardHeader>
          <CardTitle>Modalités</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Langues:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {module.language.map(lang => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium">Méthodes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {module.deliveryMethods.map(method => (
                  <Badge key={method} variant="outline" className="text-xs">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {module.refresherRequired && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">
                  Recyclage obligatoire tous les {module.refresherFrequency} mois
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Catalogue des Formations HSE
          </CardTitle>
          <p className="text-muted-foreground">
            {trainingModules.length} modules de formation selon les standards SOGARA
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous rôles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Résumé des résultats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filteredModules.length} formation(s) trouvée(s)</span>
            {(searchTerm || selectedCategory !== 'all' || selectedRole !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedRole('all')
                }}
                className="h-8 px-2"
              >
                Réinitialiser filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grille des formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map(renderModuleCard)}
      </div>

      {filteredModules.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aucune formation trouvée</h3>
            <p className="text-muted-foreground">Essayez de modifier vos critères de recherche.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog détails de formation */}
      <Dialog open={!!selectedTraining} onOpenChange={() => setSelectedTraining(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la formation</DialogTitle>
          </DialogHeader>
          {selectedTraining && renderTrainingDetails(selectedTraining)}
        </DialogContent>
      </Dialog>
    </div>
  )
}
