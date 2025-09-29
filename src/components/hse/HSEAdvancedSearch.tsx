import { useState } from 'react';
import { Search, Filter, X, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';

interface SearchFilters {
  searchTerm: string;
  dateRange?: DateRange;
  severity?: string;
  status?: string;
  assignedTo?: string;
  type?: string;
}

interface HSEAdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  placeholder?: string;
  showFilters?: string[];
}

export function HSEAdvancedSearch({ 
  onSearch, 
  onClear, 
  placeholder = "Rechercher...",
  showFilters = ['severity', 'status', 'type']
}: HSEAdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { searchTerm: '' };
    setFilters(clearedFilters);
    setShowAdvanced(false);
    onClear();
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== undefined && v !== '' && v !== null
  ).length - (filters.searchTerm ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Recherche principale */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 relative">
              <Filter className="w-4 h-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtres avancés</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {showFilters.includes('severity') && (
                <div className="space-y-2">
                  <Label>Sévérité</Label>
                  <Select 
                    value={filters.severity || ''} 
                    onValueChange={(value) => updateFilter('severity', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes sévérités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes sévérités</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="high">Élevé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showFilters.includes('status') && (
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select 
                    value={filters.status || ''} 
                    onValueChange={(value) => updateFilter('status', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous statuts</SelectItem>
                      <SelectItem value="reported">Signalé</SelectItem>
                      <SelectItem value="investigating">En cours d'enquête</SelectItem>
                      <SelectItem value="resolved">Résolu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showFilters.includes('type') && (
                <div className="space-y-2">
                  <Label>Type d'incident</Label>
                  <Select 
                    value={filters.type || ''} 
                    onValueChange={(value) => updateFilter('type', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous types</SelectItem>
                      <SelectItem value="Chute de plain-pied">Chute de plain-pied</SelectItem>
                      <SelectItem value="Chute de hauteur">Chute de hauteur</SelectItem>
                      <SelectItem value="Exposition chimique">Exposition chimique</SelectItem>
                      <SelectItem value="EPI manquant">EPI manquant</SelectItem>
                      <SelectItem value="Quasi-accident">Quasi-accident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" onClick={clearFilters} variant="outline" className="flex-1">
                  Effacer filtres
                </Button>
                <Button size="sm" onClick={() => setShowAdvanced(false)} className="flex-1">
                  Appliquer
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Effacer
          </Button>
        )}
      </div>

      {/* Filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          {filters.severity && (
            <Badge variant="outline" className="gap-1">
              Sévérité: {filters.severity}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('severity', undefined)}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="outline" className="gap-1">
              Statut: {filters.status}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('status', undefined)}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge variant="outline" className="gap-1">
              Type: {filters.type}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('type', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
