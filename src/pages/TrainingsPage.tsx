import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AppContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Calendar, Users, BookOpen } from 'lucide-react'
import TrainingCoordinator from '@/components/hse/TrainingCoordinator'
import type { HSETraining } from '@/types'

export function TrainingsPage() {
  const { currentUser, hasRole } = useAuth()
  const [trainings, setTrainings] = useState<HSETraining[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'MANDATORY' | 'RECOMMENDED' | 'SPECIALIZED'>('all')

  useEffect(() => {
    void loadTrainings()
  }, [])

  const loadTrainings = async () => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch('/api/hse/trainings', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setTrainings(data.data || [])
      }
    } catch (error) {
      console.error('Error loading trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrainings = trainings.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.code?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: trainings.length,
    mandatory: trainings.filter(t => t.category === 'MANDATORY').length,
    upcoming: trainings.filter(t => t.status === 'PLANNED').length,
    ongoing: trainings.filter(t => t.status === 'ONGOING').length,
    completed: trainings.filter(t => t.status === 'COMPLETED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Formations HSE</h1>
            </div>
            <p className="text-gray-600">Gestion et coordination des formations</p>
          </div>
          {hasRole('HSE_MANAGER') && (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle Formation
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <p className="text-gray-600 text-sm">Obligatoires</p>
            <p className="text-2xl font-bold text-red-600">{stats.mandatory}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <p className="text-gray-600 text-sm">À Venir</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.upcoming}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-gray-600 text-sm">En Cours</p>
            <p className="text-2xl font-bold text-blue-600">{stats.ongoing}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <p className="text-gray-600 text-sm">Complétées</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">Toutes catégories</option>
            <option value="MANDATORY">Obligatoires</option>
            <option value="RECOMMENDED">Recommandées</option>
            <option value="SPECIALIZED">Spécialisées</option>
          </select>
        </div>

        {/* Trainings List */}
        <Card>
          <TrainingCoordinator
            trainings={filteredTrainings}
            onSelectTraining={() => {}}
            onCreateNew={() => {}}
            loading={loading}
          />
        </Card>

        {/* Training Categories Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold">O</span>
              </div>
              <div>
                <h3 className="font-semibold">Obligatoires (Mandatory)</h3>
                <p className="text-sm text-gray-600">Formations requises par la réglementation ISO 45001 et législation locale</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold">R</span>
              </div>
              <div>
                <h3 className="font-semibold">Recommandées (Recommended)</h3>
                <p className="text-sm text-gray-600">Formations pour améliorer les compétences et la sensibilisation</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">S</span>
              </div>
              <div>
                <h3 className="font-semibold">Spécialisées (Specialized)</h3>
                <p className="text-sm text-gray-600">Formations pour rôles spécifiques ou tâches critiques</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
