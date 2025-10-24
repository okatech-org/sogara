import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { 
  FileText, 
  Shield, 
  FileCheck, 
  Download, 
  Settings,
  BarChart3,
  Users,
  AlertTriangle,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface ReportGenerationDialogProps {
  children: React.ReactNode;
}

export function ReportGenerationDialog({ children }: ReportGenerationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  const { 
    isGenerating, 
    generationProgress, 
    generateStrategicReport, 
    generateHSEIncidentsReport, 
    generateComplianceReport 
  } = useReportGeneration();

  const reportTypes = [
    {
      id: 'strategic',
      title: 'Rapport Stratégique',
      description: 'Vue d\'ensemble consolidée avec KPIs, RH, HSE et opérations',
      icon: FileText,
      color: 'bg-blue-100 text-blue-700',
      estimatedTime: '2-3 min'
    },
    {
      id: 'hse-incidents',
      title: 'Rapport Incidents HSE',
      description: 'Analyse détaillée des incidents et actions correctives',
      icon: Shield,
      color: 'bg-red-100 text-red-700',
      estimatedTime: '1-2 min'
    },
    {
      id: 'compliance',
      title: 'Rapport de Conformité',
      description: 'État de la conformité réglementaire et certifications',
      icon: FileCheck,
      color: 'bg-green-100 text-green-700',
      estimatedTime: '1-2 min'
    }
  ];

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleGenerateReports = async () => {
    if (selectedReports.length === 0) return;

    try {
      for (const reportId of selectedReports) {
        switch (reportId) {
          case 'strategic':
            await generateStrategicReport({ includeCharts, includeDetails, format, language });
            break;
          case 'hse-incidents':
            await generateHSEIncidentsReport({ includeCharts, includeDetails, format, language });
            break;
          case 'compliance':
            await generateComplianceReport({ includeCharts, includeDetails, format, language });
            break;
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la génération des rapports:', error);
    }
  };

  const getTotalEstimatedTime = () => {
    const times = selectedReports.map(id => {
      const report = reportTypes.find(r => r.id === id);
      return report ? parseInt(report.estimatedTime.split('-')[0]) : 0;
    });
    return Math.max(...times, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Génération de Rapports PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection des rapports */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Types de rapports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                const isSelected = selectedReports.includes(report.id);
                return (
                  <Card 
                    key={report.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                    }`}
                    onClick={() => handleReportToggle(report.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          <CardTitle className="text-base">{report.title}</CardTitle>
                        </div>
                        <Checkbox 
                          checked={isSelected}
                          onChange={() => handleReportToggle(report.id)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={report.color}>
                          {report.estimatedTime}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Options de génération */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Options de génération</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCharts" 
                    checked={includeCharts}
                    onCheckedChange={setIncludeCharts}
                  />
                  <Label htmlFor="includeCharts" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Inclure les graphiques
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeDetails" 
                    checked={includeDetails}
                    onCheckedChange={setIncludeDetails}
                  />
                  <Label htmlFor="includeDetails" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Inclure les détails
                  </Label>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select value={format} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Langue</Label>
                  <Select value={language} onValueChange={(value: 'fr' | 'en') => setLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé et progression */}
          {selectedReports.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Résumé</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rapports sélectionnés:</span>
                      <Badge variant="secondary">{selectedReports.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Temps estimé:</span>
                      <Badge variant="outline">{getTotalEstimatedTime()} min</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Format:</span>
                      <Badge variant="outline">{format.toUpperCase()}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Progression */}
          {isGenerating && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Génération en cours</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">Génération des rapports...</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {generationProgress}% terminé
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleGenerateReports}
              disabled={selectedReports.length === 0 || isGenerating}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Générer {selectedReports.length > 0 ? `(${selectedReports.length})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
