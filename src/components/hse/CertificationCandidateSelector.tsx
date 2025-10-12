import { useState, useMemo } from 'react';
import { Users, Building, Search, X, Briefcase, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Employee } from '@/types';

interface CertificationCandidateSelectorProps {
  employees: Employee[];
  onSelectionChange: (selectedIds: string[], selectedTypes: Record<string, 'employee' | 'external'>) => void;
  preSelectedIds?: string[];
}

export function CertificationCandidateSelector({ 
  employees, 
  onSelectionChange,
  preSelectedIds = []
}: CertificationCandidateSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(preSelectedIds);
  const [selectedTypes, setSelectedTypes] = useState<Record<string, 'employee' | 'external'>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Séparer employés internes et externes
  const internalEmployees = useMemo(() => 
    employees.filter(e => !e.roles.includes('EXTERNE')),
    [employees]
  );

  const externalCandidates = useMemo(() =>
    employees.filter(e => e.roles.includes('EXTERNE')),
    [employees]
  );

  const filteredInternals = useMemo(() => {
    return internalEmployees.filter(emp => {
      const searchLower = searchTerm.toLowerCase();
      return searchTerm === '' || 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower) ||
        emp.matricule.toLowerCase().includes(searchLower) ||
        emp.service.toLowerCase().includes(searchLower);
    });
  }, [internalEmployees, searchTerm]);

  const filteredExternals = useMemo(() => {
    return externalCandidates.filter(emp => {
      const searchLower = searchTerm.toLowerCase();
      return searchTerm === '' ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower) ||
        emp.service.toLowerCase().includes(searchLower);
    });
  }, [externalCandidates, searchTerm]);

  const toggleCandidate = (candidateId: string, type: 'employee' | 'external') => {
    const updated = selectedIds.includes(candidateId)
      ? selectedIds.filter(id => id !== candidateId)
      : [...selectedIds, candidateId];
    
    const updatedTypes = { ...selectedTypes };
    if (updated.includes(candidateId)) {
      updatedTypes[candidateId] = type;
    } else {
      delete updatedTypes[candidateId];
    }
    
    setSelectedIds(updated);
    setSelectedTypes(updatedTypes);
    onSelectionChange(updated, updatedTypes);
  };

  const selectAllInternal = () => {
    const internalIds = filteredInternals.map(e => e.id);
    const newTypes = { ...selectedTypes };
    internalIds.forEach(id => newTypes[id] = 'employee');
    
    const updated = [...new Set([...selectedIds, ...internalIds])];
    setSelectedIds(updated);
    setSelectedTypes(newTypes);
    onSelectionChange(updated, newTypes);
  };

  const selectAllExternal = () => {
    const externalIds = filteredExternals.map(e => e.id);
    const newTypes = { ...selectedTypes };
    externalIds.forEach(id => newTypes[id] = 'external');
    
    const updated = [...new Set([...selectedIds, ...externalIds])];
    setSelectedIds(updated);
    setSelectedTypes(newTypes);
    onSelectionChange(updated, newTypes);
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectedTypes({});
    onSelectionChange([], {});
  };

  const internalSelected = selectedIds.filter(id => selectedTypes[id] === 'employee').length;
  const externalSelected = selectedIds.filter(id => selectedTypes[id] === 'external').length;

  return (
    <div className="space-y-4">
      {/* En-tête avec compteurs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Sélection des candidats</h3>
          </div>
          <div className="flex gap-2">
            {internalSelected > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Briefcase className="w-3 h-3 mr-1" />
                {internalSelected} interne{internalSelected > 1 ? 's' : ''}
              </Badge>
            )}
            {externalSelected > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Building className="w-3 h-3 mr-1" />
                {externalSelected} externe{externalSelected > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        {selectedIds.length > 0 && (
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <X className="w-4 h-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un candidat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Onglets Internes/Externes */}
      <Tabs defaultValue="external" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="external">
            <Building className="w-4 h-4 mr-2" />
            Candidats Externes ({externalCandidates.length})
          </TabsTrigger>
          <TabsTrigger value="internal">
            <Briefcase className="w-4 h-4 mr-2" />
            Employés Internes ({internalEmployees.length})
          </TabsTrigger>
        </TabsList>

        {/* Candidats Externes */}
        <TabsContent value="external" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Personnel externe (sous-traitants, partenaires, visiteurs)
            </p>
            {filteredExternals.length > 0 && (
              <Button size="sm" variant="outline" onClick={selectAllExternal}>
                Tout sélectionner
              </Button>
            )}
          </div>

          {filteredExternals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun candidat externe enregistré</p>
              <p className="text-xs mt-1">
                Les candidats externes apparaîtront ici après enregistrement
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[250px] border rounded-md p-3">
              <div className="space-y-2">
                {filteredExternals.map(candidate => (
                  <div 
                    key={candidate.id} 
                    className="flex items-center space-x-3 p-3 hover:bg-orange-50 rounded transition-colors border border-orange-100"
                  >
                    <Checkbox
                      id={`ext-${candidate.id}`}
                      checked={selectedIds.includes(candidate.id)}
                      onCheckedChange={() => toggleCandidate(candidate.id, 'external')}
                    />
                    <label
                      htmlFor={`ext-${candidate.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {candidate.firstName} {candidate.lastName}
                            </p>
                            <Badge className="bg-orange-500 text-xs">EXTERNE</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {candidate.service} • {candidate.matricule}
                          </p>
                          {candidate.email && (
                            <p className="text-xs text-muted-foreground">{candidate.email}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Employés Internes */}
        <TabsContent value="internal" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Personnel SOGARA (employés permanents)
            </p>
            {filteredInternals.length > 0 && (
              <Button size="sm" variant="outline" onClick={selectAllInternal}>
                Tout sélectionner
              </Button>
            )}
          </div>

          <ScrollArea className="h-[250px] border rounded-md p-3">
            <div className="space-y-2">
              {filteredInternals.map(employee => (
                <div 
                  key={employee.id} 
                  className="flex items-center space-x-3 p-3 hover:bg-blue-50 rounded transition-colors border border-blue-100"
                >
                  <Checkbox
                    id={`int-${employee.id}`}
                    checked={selectedIds.includes(employee.id)}
                    onCheckedChange={() => toggleCandidate(employee.id, 'employee')}
                  />
                  <label
                    htmlFor={`int-${employee.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {employee.service}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {employee.matricule} • {employee.roles.join(', ')}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Résumé sélection */}
      {selectedIds.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="font-medium text-sm text-purple-900">
                    {selectedIds.length} candidat{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-purple-700">
                    {internalSelected > 0 && `${internalSelected} interne${internalSelected > 1 ? 's' : ''}`}
                    {internalSelected > 0 && externalSelected > 0 && ' • '}
                    {externalSelected > 0 && `${externalSelected} externe${externalSelected > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Effacer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

