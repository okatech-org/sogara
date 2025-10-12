import { useState } from 'react';
import { Award, BookOpen, FileText, ArrowRight, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import evaluationsData from '@/data/evaluations-sogara.json';

interface CertificationPathSelectorProps {
  onSelect: (pathId: string) => void;
  selectedPathId?: string;
}

export function CertificationPathSelector({ onSelect, selectedPathId }: CertificationPathSelectorProps) {
  const paths = evaluationsData.certificationPaths;
  const [selectedPath, setSelectedPath] = useState(selectedPathId || '');

  const handleSelect = (pathId: string) => {
    setSelectedPath(pathId);
    onSelect(pathId);
  };

  const selectedPathData = paths.find(p => p.id === selectedPath);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Sélectionnez un parcours de certification</label>
        <Select value={selectedPath} onValueChange={handleSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choisissez un parcours..." />
          </SelectTrigger>
          <SelectContent>
            {paths.map((path) => (
              <SelectItem key={path.id} value={path.id}>
                {path.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPathData && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">
              {selectedPathData.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedPathData.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Schéma du parcours */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {/* Étape 1: Formation */}
              <div className="flex-1 min-w-[200px] p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-500 rounded">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-sm">Formation</span>
                </div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {selectedPathData.trainingTitle}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{selectedPathData.trainingDuration}h</span>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="text-xs text-center flex-shrink-0">
                <Clock className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                <span className="font-medium">{selectedPathData.daysBeforeAssessment} jours</span>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

              {/* Étape 2: Évaluation */}
              <div className="flex-1 min-w-[200px] p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-purple-500 rounded">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-sm">Évaluation</span>
                </div>
                <p className="text-sm font-medium text-purple-900 mb-1">
                  {selectedPathData.assessmentTitle}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{selectedPathData.assessmentDuration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>≥{selectedPathData.passingScore}%</span>
                  </div>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

              {/* Étape 3: Habilitation */}
              <div className="flex-1 min-w-[200px] p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-green-500 rounded">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-sm">Habilitation</span>
                </div>
                <p className="text-sm font-medium text-green-900 mb-1">
                  {selectedPathData.habilitationName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Code: {selectedPathData.habilitationCode}</span>
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  Valide {selectedPathData.habilitationValidity} mois
                </Badge>
              </div>
            </div>

            {/* Détails */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Formation prérequise</p>
                <p className="font-medium">{selectedPathData.trainingTitle}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Délai avant évaluation</p>
                <p className="font-medium">{selectedPathData.daysBeforeAssessment} jours (révision)</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Score minimum requis</p>
                <p className="font-medium text-purple-600">{selectedPathData.passingScore}%</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Validité habilitation</p>
                <p className="font-medium text-green-600">{selectedPathData.habilitationValidity} mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

