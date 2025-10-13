import { useState } from 'react'
import {
  FileCheck,
  Award,
  Building,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AppContext'
import { useAssessments } from '@/hooks/useAssessments'
import { useNavigate } from 'react-router-dom'

export function ExternalDashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { getMyCandidateSubmissions } = useAssessments()

  const mySubmissions = getMyCandidateSubmissions(currentUser?.id || '')
  const pending = mySubmissions.filter(s => s.status === 'assigned' || s.status === 'in_progress')
  const passed = mySubmissions.filter(s => s.status === 'passed')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête Candidat Externe */}
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-orange-600">
                  {currentUser?.firstName?.[0]}
                  {currentUser?.lastName?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Bienvenue, {currentUser?.firstName} {currentUser?.lastName}
                </h1>
                <p className="text-muted-foreground">{currentUser?.service}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{currentUser?.matricule}</Badge>
              <Badge className="bg-orange-500 text-white">Candidat Externe</Badge>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-5xl font-bold text-orange-600 mb-1">{passed.length}</div>
            <p className="text-sm text-muted-foreground">Habilitation(s) obtenue(s)</p>
          </div>
        </div>
      </div>

      {/* Alerte si tests en attente */}
      {pending.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">
                  {pending.length} test{pending.length > 1 ? 's' : ''} d'habilitation en attente
                </p>
                <p className="text-sm text-yellow-800">
                  Vous devez compléter ces tests pour obtenir les autorisations d'accès à la
                  raffinerie
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/app/mes-evaluations')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Voir les tests
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tests assignés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mySubmissions.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pending.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Réussis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{passed.length}</div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Habilitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {currentUser?.habilitations.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mes Informations */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Mes Informations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                <Building className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Société</p>
                  <p className="font-medium">{currentUser?.service}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                <User className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Poste</p>
                  <p className="font-medium">{currentUser?.jobTitle}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                <Mail className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{currentUser?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                <Phone className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{currentUser?.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mes Habilitations Obtenues */}
      {currentUser && currentUser.habilitations.length > 0 && (
        <Card className="industrial-card border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Award className="w-5 h-5" />
              Mes Habilitations Obtenues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentUser.habilitations.map((hab, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">{hab}</p>
                    <p className="text-xs text-muted-foreground">Valide 12 mois</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accès Rapide */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle>Accès Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 justify-start gap-3"
              onClick={() => navigate('/app/mes-evaluations')}
            >
              <div className="p-2 bg-orange-100 rounded">
                <FileCheck className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Mes Évaluations</p>
                <p className="text-xs text-muted-foreground">Tests d'habilitation</p>
              </div>
              {pending.length > 0 && <Badge className="ml-auto">{pending.length}</Badge>}
            </Button>

            <Button variant="outline" className="h-auto py-4 justify-start gap-3" disabled>
              <div className="p-2 bg-blue-100 rounded">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Mon Planning</p>
                <p className="text-xs text-muted-foreground">Interventions prévues</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations Importantes */}
      <Card className="industrial-card bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">
            Informations Importantes - Accès Raffinerie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>
            • <strong>Tests obligatoires:</strong> Vous devez réussir tous les tests assignés (score
            ≥ 80%)
          </p>
          <p>
            • <strong>Correction:</strong> Les questions à réponse libre sont corrigées par le
            Responsable HSE
          </p>
          <p>
            • <strong>Résultats:</strong> Vous recevrez vos résultats par email sous 24-48 heures
          </p>
          <p>
            • <strong>Certificats:</strong> Les habilitations sont valables 12 mois à compter de la
            réussite
          </p>
          <p>
            • <strong>Accès site:</strong> Présentez vos certificats à l'accueil de la raffinerie
          </p>
          <p>
            • <strong>Sécurité:</strong> Le respect strict des procédures de sécurité est
            obligatoire
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
