import React, { useState } from 'react'
import { HSETraining } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  Calendar,
  Users,
  Clock,
  BookOpen,
  Plus,
  Eye,
  BarChart3,
} from 'lucide-react'

interface TrainingCoordinatorProps {
  trainings: HSETraining[]
  onSelectTraining: (training: HSETraining) => void
  onCreateNew?: () => void
  loading?: boolean
}

export default function TrainingCoordinator({
  trainings,
  onSelectTraining,
  onCreateNew,
  loading = false,
}: TrainingCoordinatorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = trainings.filter(t => {
    const categoryMatch = filterCategory === 'all' || t.category === filterCategory
    const statusMatch = filterStatus === 'all' || t.status === filterStatus
    const searchMatch = t.title.toLowerCase().includes(searchTerm.toLowerCase())
    return categoryMatch && statusMatch && searchMatch
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      MANDATORY: 'bg-red-100 text-red-800',
      RECOMMENDED: 'bg-blue-100 text-blue-800',
      SPECIALIZED: 'bg-purple-100 text-purple-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MANDATORY':
        return '⚠️'
      case 'RECOMMENDED':
        return '💡'
      case 'SPECIALIZED':
        return '🎯'
      default:
        return '📚'
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planned: '📅 Planifiée',
      ongoing: '▶️ En cours',
      completed: '✅ Complétée',
      cancelled: '❌ Annulée',
    }
    return labels[status] || status
  }

  const getParticipantCount = (training: HSETraining) => {
    return training.schedule?.sessions?.reduce((acc, session) => acc + (session.enrolled?.length || 0), 0) || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin text-primary mb-2">
            <BookOpen className="w-8 h-8" />
          </div>
          <p className="text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Coordination des Formations HSE</h2>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle Formation
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Rechercher formations..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="MANDATORY">Obligatoires</SelectItem>
            <SelectItem value="RECOMMENDED">Recommandées</SelectItem>
            <SelectItem value="SPECIALIZED">Spécialisées</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="planned">Planifiées</SelectItem>
            <SelectItem value="ongoing">En cours</SelectItem>
            <SelectItem value="completed">Complétées</SelectItem>
            <SelectItem value="cancelled">Annulées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <div className="text-sm text-gray-600">
        {filtered.length} formation{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Trainings Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Aucune formation trouvée</p>
          </Card>
        ) : (
          filtered.map(training => (
            <Card
              key={training.id}
              className="p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => onSelectTraining(training)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">{getCategoryIcon(training.category)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{training.title}</h3>
                      {training.code && (
                        <p className="text-xs text-gray-500">Code: {training.code}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{training.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{training.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{getParticipantCount(training)} participants</span>
                    </div>
                    {training.schedule?.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(training.schedule.startDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {training.validityMonths && (
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        <span>Valide {training.validityMonths} mois</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(training.category)}>
                      {getCategoryIcon(training.category)} {training.category}
                    </Badge>
                    <Badge className={getStatusColor(training.status)}>
                      {getStatusLabel(training.status)}
                    </Badge>
                    {training.compliance?.requiredFrequency && (
                      <Badge variant="outline">
                        {training.compliance.requiredFrequency.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    onSelectTraining(training)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}