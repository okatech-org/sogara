import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Employee, Visitor, Equipment } from '@/types';
import { QrCode, Download, User, HardHat, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QRGeneratorProps {
  type: 'visitor' | 'equipment' | 'employee';
  data: Visitor | Equipment | Employee;
  size?: number;
  visitDetails?: {
    checkOutTime?: Date;
    badgeNumber?: string;
    hostEmployee?: Employee;
  };
  className?: string;
}

interface QRData {
  type: string;
  id: string;
  data: any;
  generatedAt: string;
  expiresAt?: string;
}

export function QRGenerator({ 
  type, 
  data, 
  size = 200, 
  visitDetails,
  className 
}: QRGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);

  useEffect(() => {
    generateQRCode();
  }, [type, data, visitDetails]);

  const generateQRData = (): QRData => {
    const baseData = {
      type,
      id: data.id,
      generatedAt: new Date().toISOString()
    };

    switch (type) {
      case 'visitor':
        const visitor = data as Visitor;
        return {
          ...baseData,
          data: {
            id: visitor.id,
            name: `${visitor.firstName} ${visitor.lastName}`,
            company: visitor.company,
            document: visitor.idDocument,
            badgeNumber: visitDetails?.badgeNumber,
            host: visitDetails?.hostEmployee ? {
              name: `${visitDetails.hostEmployee.firstName} ${visitDetails.hostEmployee.lastName}`,
              service: visitDetails.hostEmployee.service
            } : undefined,
            validUntil: visitDetails?.checkOutTime?.toISOString()
          },
          expiresAt: visitDetails?.checkOutTime?.toISOString()
        };

      case 'equipment':
        const equipment = data as Equipment;
        return {
          ...baseData,
          data: {
            id: equipment.id,
            label: equipment.label,
            type: equipment.type,
            serialNumber: equipment.serialNumber,
            status: equipment.status,
            location: equipment.location,
            checkDate: equipment.nextCheckDate?.toISOString()
          }
        };

      case 'employee':
        const employee = data as Employee;
        return {
          ...baseData,
          data: {
            id: employee.id,
            matricule: employee.matricule,
            name: `${employee.firstName} ${employee.lastName}`,
            service: employee.service,
            roles: employee.roles
          }
        };

      default:
        throw new Error(`Type de QR code non supporté: ${type}`);
    }
  };

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      const qrData = generateQRData();
      setQrData(qrData);
      
      // Générer le QR code
      const qrString = JSON.stringify(qrData);
      const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeUrl(qrCodeDataUrl);
      
    } catch (error) {
      console.error('Erreur génération QR code:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le QR code',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-${type}-${data.id}-${Date.now()}.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'QR code téléchargé',
      description: 'Le QR code a été sauvegardé'
    });
  };

  const copyQRData = () => {
    if (!qrData) return;
    
    navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
    toast({
      title: 'Données copiées',
      description: 'Les données du QR code ont été copiées'
    });
  };

  const getQRTitle = (): string => {
    switch (type) {
      case 'visitor':
        const visitor = data as Visitor;
        return `Badge visiteur - ${visitor.firstName} ${visitor.lastName}`;
      case 'equipment':
        const equipment = data as Equipment;
        return `Équipement - ${equipment.label}`;
      case 'employee':
        const employee = data as Employee;
        return `Employé - ${employee.firstName} ${employee.lastName}`;
      default:
        return 'QR Code';
    }
  };

  const getQRDescription = (): string => {
    switch (type) {
      case 'visitor':
        const visitor = data as Visitor;
        return `${visitor.company} • ${visitDetails?.badgeNumber || 'Badge à attribuer'}`;
      case 'equipment':
        const equipment = data as Equipment;
        return `${equipment.type} • ${equipment.serialNumber || 'Pas de N° série'}`;
      case 'employee':
        const employee = data as Employee;
        return `${employee.matricule} • ${employee.service}`;
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'visitor':
        return <User className="w-5 h-5" />;
      case 'equipment':
        return <HardHat className="w-5 h-5" />;
      case 'employee':
        return <User className="w-5 h-5" />;
      default:
        return <QrCode className="w-5 h-5" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {getQRTitle()}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {getQRDescription()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center">
          {isGenerating ? (
            <div className="flex items-center justify-center w-48 h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Génération...</p>
              </div>
            </div>
          ) : qrCodeUrl ? (
            <div className="p-4 bg-white rounded-lg border">
              <img 
                src={qrCodeUrl} 
                alt="QR Code"
                className="mx-auto"
                width={size}
                height={size}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-48 h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Erreur génération</p>
            </div>
          )}
        </div>

        {/* Informations du QR code */}
        {qrData && (
          <div className="space-y-3">
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Informations encodées</h4>
              
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{qrData.type}</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{qrData.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Généré le:</span>
                  <span>{format(new Date(qrData.generatedAt), "dd/MM/yyyy HH:mm")}</span>
                </div>
                
                {qrData.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expire le:</span>
                    <span className="text-red-600">
                      {format(new Date(qrData.expiresAt), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Données spécifiques par type */}
            {type === 'visitor' && visitDetails && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Détails visite</h4>
                <div className="text-xs space-y-1">
                  {visitDetails.badgeNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Badge:</span>
                      <span className="font-mono">{visitDetails.badgeNumber}</span>
                    </div>
                  )}
                  {visitDetails.hostEmployee && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hôte:</span>
                      <span>{visitDetails.hostEmployee.firstName} {visitDetails.hostEmployee.lastName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {type === 'equipment' && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Détails équipement</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut:</span>
                    <Badge 
                      variant={
                        (data as Equipment).status === 'operational' ? 'default' :
                        (data as Equipment).status === 'maintenance' ? 'secondary' :
                        'destructive'
                      }
                    >
                      {(data as Equipment).status}
                    </Badge>
                  </div>
                  {(data as Equipment).nextCheckDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prochain contrôle:</span>
                      <span>{format((data as Equipment).nextCheckDate!, "dd/MM/yyyy")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={downloadQRCode}
            disabled={!qrCodeUrl}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          
          <Button
            onClick={copyQRData}
            disabled={!qrData}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Copier données
          </Button>
        </div>

        {/* Avertissement pour les visiteurs */}
        {type === 'visitor' && visitDetails?.checkOutTime && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Ce QR code expirera automatiquement le {format(visitDetails.checkOutTime, "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
          </div>
        )}

        {/* Instructions d'usage */}
        <div className="p-3 bg-muted/30 rounded text-xs text-muted-foreground">
          <p className="font-medium mb-1">Instructions :</p>
          <ul className="space-y-1">
            {type === 'visitor' && (
              <>
                <li>• Imprimer et remettre au visiteur avec le badge</li>
                <li>• Scanner à l'entrée et à la sortie</li>
                <li>• Vérifier l'expiration avant utilisation</li>
              </>
            )}
            {type === 'equipment' && (
              <>
                <li>• Coller sur l'équipement de manière visible</li>
                <li>• Scanner pour accéder aux détails et à l'historique</li>
                <li>• Utiliser pour les contrôles et la maintenance</li>
              </>
            )}
            {type === 'employee' && (
              <>
                <li>• Intégrer au badge employé</li>
                <li>• Scanner pour accéder au profil</li>
                <li>• Utiliser pour les contrôles d'accès</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour scanner les QR codes
interface QRScannerProps {
  onScan: (data: QRData) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [manualInput, setManualInput] = useState('');

  const handleManualScan = () => {
    try {
      const parsedData = JSON.parse(manualInput);
      
      // Valider la structure des données
      if (!parsedData.type || !parsedData.id || !parsedData.data) {
        throw new Error('Format de QR code invalide');
      }
      
      // Vérifier l'expiration
      if (parsedData.expiresAt && new Date(parsedData.expiresAt) < new Date()) {
        throw new Error('QR code expiré');
      }
      
      onScan(parsedData);
      setManualInput('');
      
      toast({
        title: 'QR code scanné',
        description: 'Données récupérées avec succès'
      });
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'QR code invalide';
      onError?.(message);
      toast({
        title: 'Erreur scan',
        description: message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Scanner QR Code
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="manual-qr">Données QR Code (manuel)</Label>
          <Textarea
            id="manual-qr"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Collez les données du QR code ici..."
            rows={4}
          />
        </div>
        
        <Button
          onClick={handleManualScan}
          disabled={!manualInput.trim()}
          className="w-full"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Scanner
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          En production, utiliser la caméra pour scanner automatiquement
        </div>
      </CardContent>
    </Card>
  );
}
