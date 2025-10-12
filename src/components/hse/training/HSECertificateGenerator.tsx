import { useState } from 'react';
import { Download, Award, Calendar, User, Shield, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HSETrainingModule, HSETrainingProgress } from '@/types';
import { useAuth } from '@/contexts/AppContext';
import { PDFGeneratorService } from '@/services/pdf-generator.service';

interface HSECertificateGeneratorProps {
  module: HSETrainingModule;
  progress: HSETrainingProgress;
  employeeId: string;
  onDownload: () => void;
}

export function HSECertificateGenerator({ 
  module, 
  progress, 
  employeeId, 
  onDownload 
}: HSECertificateGeneratorProps) {
  const { currentUser, getEmployeeById } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const employee = getEmployeeById?.(employeeId) || currentUser;

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      if (!employee) throw new Error('Informations employé manquantes');
      
      const pdfBlob = await PDFGeneratorService.generateTrainingCertificate(
        module,
        progress,
        employee
      );
      
      const filename = `certificat-${module.code}-${employee.firstName}-${employee.lastName}-${new Date().getFullYear()}.pdf`;
      await PDFGeneratorService.downloadPDF(pdfBlob, filename);
      
      onDownload();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!progress.completedAt || !progress.certificateIssuedAt) {
    return (
      <div className="text-center py-8">
        <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Certificat non disponible. Terminez d'abord la formation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aperçu du certificat */}
      <Card className="border-2 border-primary bg-gradient-to-br from-white to-primary/5">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Logo et en-tête */}
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-white rounded-lg shadow-sm flex items-center justify-center">
                <img
                  src="/Sogara_logo.png"
                  alt="SOGARA"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">SOGARA</h1>
                <p className="text-sm text-muted-foreground">Société Gabonaise de Raffinage</p>
              </div>
            </div>

            {/* Titre du certificat */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold">CERTIFICAT DE FORMATION HSE</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {module.certification.certificateType}
              </Badge>
            </div>

            {/* Informations du participant */}
            <div className="space-y-4 p-6 bg-white rounded-lg border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Certifie que</p>
                <h3 className="text-xl font-bold text-foreground">
                  {employee?.firstName} {employee?.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Matricule: {employee?.matricule} • Service: {employee?.service}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">a suivi avec succès la formation</p>
                <h4 className="text-lg font-semibold text-primary">
                  {module.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Code: {module.code} • Durée: {module.duration} {module.durationUnit}
                </p>
              </div>
            </div>

            {/* Détails de certification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Date d'obtention</div>
                  <div className="text-muted-foreground">
                    {progress.completedAt.toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 justify-center">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Validité</div>
                  <div className="text-muted-foreground">
                    {progress.expiresAt?.toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center">
                <Award className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Score</div>
                  <div className="text-muted-foreground">
                    {progress.assessmentResults[0]?.score || 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Signature et validation */}
            <div className="pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="h-16 border-b border-muted mb-2"></div>
                  <p className="text-sm font-medium">Responsable HSE</p>
                  <p className="text-xs text-muted-foreground">Marie-Claire NZIEGE</p>
                </div>
                <div className="text-center">
                  <div className="h-16 border-b border-muted mb-2"></div>
                  <p className="text-sm font-medium">Directeur</p>
                  <p className="text-xs text-muted-foreground">SOGARA</p>
                </div>
              </div>
            </div>

            {/* Numéro de certificat */}
            <div className="text-xs text-muted-foreground">
              Certificat N° {module.code}-{employeeId.slice(-6)}-{progress.completedAt.getFullYear()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Génération en cours...' : 'Télécharger le PDF'}
        </Button>
        
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Imprimer
        </Button>
      </div>

      {/* Informations importantes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Informations importantes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ce certificat est personnel et non transférable</li>
                <li>• Il doit être présenté en cas de contrôle HSE</li>
                <li>• Une formation de recyclage sera requise avant expiration</li>
                <li>• En cas de perte, contactez le service HSE (poste 2250)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
