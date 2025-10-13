import { useState, useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, Play, Square } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AppContext'
import { useVacations } from '@/hooks/useVacations'

export function MonPlanningPage() {
  const { currentUser } = useAuth()
  const { vacations, loading, checkIn, checkOut, getTotalHours } = useVacations()

  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  const myVacations = useMemo(() => {
    return vacations
      .filter(v => {
        const vDate = new Date(v.date)
        return (
          v.employeeId === currentUser?.id &&
          vDate.getMonth() + 1 === selectedMonth &&
          vDate.getFullYear() === selectedYear
        )
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [vacations, currentUser?.id, selectedMonth, selectedYear])

  const totalHours = useMemo(() => {
    return myVacations.reduce((sum, v) => sum + (v.actualHours || v.plannedHours), 0)
  }, [myVacations])

  const getVacationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SHIFT_12H_DAY: '🌞 Jour 12h (7h-19h)',
      SHIFT_12H_NIGHT: '🌙 Nuit 12h (19h-7h)',
      SHIFT_8H_MORNING: '🌅 Matin 8h (6h-14h)',
      SHIFT_8H_AFTERNOON: '☀️ Après-midi 8h (14h-22h)',
      SHIFT_8H_NIGHT: '🌃 Nuit 8h (22h-6h)',
      CUSTOM: '⚙️ Personnalisé',
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; color: string }> = {
      PLANNED: { variant: 'secondary', label: 'Planifié', color: 'bg-gray-100' },
      CONFIRMED: { variant: 'default', label: 'Confirmé', color: 'bg-blue-100' },
      IN_PROGRESS: { variant: 'default', label: 'En cours', color: 'bg-yellow-100' },
      COMPLETED: { variant: 'default', label: 'Terminé', color: 'bg-green-100' },
      CANCELLED: { variant: 'destructive', label: 'Annulé', color: 'bg-red-100' },
      ABSENT: { variant: 'destructive', label: 'Absent', color: 'bg-red-100' },
    }
    return variants[status] || variants['PLANNED']
  }

  const months = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-green-600" />
          </div>
          Mon Planning
        </h1>
        <p className="text-muted-foreground mt-2">Mes vacations et horaires de travail</p>
      </div>

      {/* Sélection période */}
      <Card className="industrial-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Mois</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={v => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Année</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={v => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vacations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myVacations.length}</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Heures totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Travaillées</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {myVacations.filter(v => v.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-muted-foreground">Terminées</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">À venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {myVacations.filter(v => v.status === 'PLANNED' || v.status === 'CONFIRMED').length}
            </div>
            <p className="text-xs text-muted-foreground">Planifiées</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des vacations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Mes Vacations - {months[selectedMonth - 1]} {selectedYear}
        </h2>

        {myVacations.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="text-center py-16">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucune vacation planifiée</h3>
              <p className="text-muted-foreground">Vos vacations pour ce mois apparaîtront ici.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myVacations.map(vacation => {
              const statusInfo = getStatusBadge(vacation.status)
              const isToday = new Date(vacation.date).toDateString() === new Date().toDateString()

              return (
                <Card
                  key={vacation.id}
                  className={`industrial-card ${isToday ? 'border-2 border-primary' : ''}`}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                          {isToday && (
                            <Badge variant="outline" className="border-primary text-primary">
                              Aujourd'hui
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg mb-1">
                          {getVacationTypeLabel(vacation.type)}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{new Date(vacation.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(vacation.startTime).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {' - '}
                              {new Date(vacation.endTime).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{vacation.siteName}</span>
                          </div>
                        </div>

                        <div className="mt-2 text-sm">
                          <span className="font-medium">Heures: </span>
                          {vacation.actualHours ? (
                            <span className="text-green-600">{vacation.actualHours}h (réel)</span>
                          ) : (
                            <span>{vacation.plannedHours}h (prévu)</span>
                          )}
                        </div>
                      </div>

                      {/* Actions pointage */}
                      <div className="flex gap-2">
                        {vacation.status === 'CONFIRMED' && isToday && !vacation.checkInTime && (
                          <Button onClick={() => checkIn(vacation.id)} className="gap-2">
                            <Play className="w-4 h-4" />
                            Pointer arrivée
                          </Button>
                        )}
                        {vacation.status === 'IN_PROGRESS' &&
                          vacation.checkInTime &&
                          !vacation.checkOutTime && (
                            <Button
                              onClick={() => {
                                const duration =
                                  (Date.now() - vacation.checkInTime.getTime()) / (1000 * 60 * 60)
                                const overtime = Math.max(0, duration - vacation.plannedHours)
                                checkOut(vacation.id, duration, overtime)
                              }}
                              variant="outline"
                              className="gap-2"
                            >
                              <Square className="w-4 h-4" />
                              Pointer départ
                            </Button>
                          )}
                        {vacation.status === 'COMPLETED' && (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
