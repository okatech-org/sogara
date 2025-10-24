import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, RefreshCw } from 'lucide-react'

interface FilterState {
  search: string
  service: string
  status: string
  role: string
}

interface EmployeeFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onReset: () => void
  availableServices: string[]
  availableRoles: string[]
  loading?: boolean
}

export function EmployeeFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  availableServices, 
  availableRoles,
  loading = false 
}: EmployeeFiltersProps) {
  const hasActiveFilters = filters.service !== 'all' || 
                          filters.status !== 'all' || 
                          filters.role !== 'all' || 
                          filters.search.trim() !== ''

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const removeFilter = (key: keyof FilterState) => {
    const resetValue = key === 'search' ? '' : 'all'
    onFiltersChange({
      ...filters,
      [key]: resetValue
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres et recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, matricule, email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Service</label>
            <Select 
              value={filters.service} 
              onValueChange={(value) => handleFilterChange('service', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>
                {availableServices.map(service => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Statut</label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Rôle</label>
            <Select 
              value={filters.role} 
              onValueChange={(value) => handleFilterChange('role', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {availableRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtres actifs */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filtres actifs :</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onReset}
                disabled={loading}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.service !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Service: {filters.service}
                  <button
                    onClick={() => removeFilter('service')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Statut: {filters.status}
                  <button
                    onClick={() => removeFilter('status')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.role !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Rôle: {filters.role}
                  <button
                    onClick={() => removeFilter('role')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.search.trim() && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Recherche: "{filters.search}"
                  <button
                    onClick={() => removeFilter('search')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
