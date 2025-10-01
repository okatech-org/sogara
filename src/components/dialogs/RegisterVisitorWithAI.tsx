import { useState } from 'react';
import { Camera, Sparkles, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIDocumentScanner } from './AIDocumentScanner';
import { visitorService, VisitorExtended } from '@/services/visitor-management.service';
import { ExtractionResult } from '@/services/ai-extraction.service';
import { useEmployees } from '@/hooks/useEmployees';
import { toast } from '@/hooks/use-toast';

interface RegisterVisitorWithAIProps {
  onSuccess: (visitor: VisitorExtended) => void;
  onCancel: () => void;
  open: boolean;
}

export function RegisterVisitorWithAI({ onSuccess, onCancel, open }: RegisterVisitorWithAIProps) {
  const { employees } = useEmployees();
  const [showScanner, setShowScanner] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    idType: 'CNI' as const,
    idNumber: '',
    nationality: 'Gabonaise',
    purposeOfVisit: '',
    employeeToVisit: '',
    department: '',
    expectedDuration: '1h',
    urgencyLevel: 'normal' as const,
    accessMode: 'badge' as const,
    securityLevel: 'standard' as const
  });

  const handleExtractionComplete = (result: ExtractionResult) => {
    setShowScanner(false);
    
    if (result.success) {
      setExtractedData(result.data);
      setFormData(prev => ({
        ...prev,
        firstName: result.data.firstName || prev.firstName,
        lastName: result.data.lastName || prev.lastName,
        idNumber: result.data.idNumber || result.data.passportNumber || result.data.licenseNumber || prev.idNumber,
        idType: result.data.idType || prev.idType,
        nationality: result.data.nationality || prev.nationality
      }));
      
      toast({
        title: 'Extraction réussie',
        description: `Confiance: ${Math.round(result.confidence * 100)}%`,
      });
    } else {
      toast({
        title: 'Échec de l\'extraction',
        description: 'Veuillez saisir les informations manuellement',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast({
        title: 'Champs requis manquants',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const visitor: VisitorExtended = {
        id: '',
        badgeNumber: '',
        qrCode: '',
        ...formData,
        accessZones: ['reception', 'hall'],
        hasKeptItems: false,
        checkInTime: new Date().toISOString(),
        expectedCheckOut: '',
        status: 'present',
        lastSeen: new Date().toISOString(),
        location: 'reception',
        issuedBy: 'reception',
        serviceRequested: formData.department,
        aiExtracted: !!extractedData,
        aiConfidence: extractedData ? 0.92 : undefined,
        requiresVerification: extractedData?.requiresVerification || false
      };
      
      onSuccess(visitor);
      
      toast({
        title: 'Visiteur enregistré',
        description: `${formData.firstName} ${formData.lastName} a été enregistré avec succès`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le visiteur',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open && !showScanner} onOpenChange={onCancel}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Enregistrer un Visiteur
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bouton scanner */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">Extraction IA Automatique</h4>
                      <p className="text-sm text-blue-700">Scannez une pièce d'identité pour remplir automatiquement</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Scanner document
                  </Button>
                </div>

                {extractedData && (
                  <Alert className="mt-4 border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Données extraites avec succès ! Vérifiez et complétez si nécessaire.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Formulaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Société</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idType">Type de pièce d'identité</Label>
                <Select 
                  value={formData.idType} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, idType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNI">Carte Nationale d'Identité</SelectItem>
                    <SelectItem value="passeport">Passeport</SelectItem>
                    <SelectItem value="permis">Permis de conduire</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">Numéro de pièce</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="purposeOfVisit">Objet de la visite *</Label>
                <Input
                  id="purposeOfVisit"
                  value={formData.purposeOfVisit}
                  onChange={(e) => setFormData(prev => ({ ...prev, purposeOfVisit: e.target.value }))}
                  required
                  placeholder="Ex: Réunion, Livraison, Entretien..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeToVisit">Employé à rencontrer</Label>
                <Select 
                  value={formData.employeeToVisit} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, employeeToVisit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Service/Département</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDuration">Durée estimée</Label>
                <Select 
                  value={formData.expectedDuration} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expectedDuration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30min">30 minutes</SelectItem>
                    <SelectItem value="1h">1 heure</SelectItem>
                    <SelectItem value="2h">2 heures</SelectItem>
                    <SelectItem value="4h">4 heures</SelectItem>
                    <SelectItem value="journee">Toute la journée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgencyLevel">Niveau d'urgence</Label>
                <Select 
                  value={formData.urgencyLevel} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, urgencyLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Enregistrer visiteur
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && (
        <AIDocumentScanner
          title="Scanner une pièce d'identité"
          documentType="identity"
          onExtracted={handleExtractionComplete}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </>
  );
}

