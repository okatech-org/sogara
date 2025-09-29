import { useState } from 'react';
import { Eye, Download, Maximize2, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HSEIllustration } from '@/types';

interface HSEIllustrationViewerProps {
  illustrations: HSEIllustration[];
  className?: string;
}

export function HSEIllustrationViewer({ illustrations, className }: HSEIllustrationViewerProps) {
  const [selectedIllustration, setSelectedIllustration] = useState<HSEIllustration | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diagram': return '📊';
      case 'photo': return '📷';
      case 'schema': return '🔧';
      case 'infographic': return '📈';
      case 'chart': return '📉';
      default: return '🖼️';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'diagram': return 'default';
      case 'photo': return 'secondary';
      case 'schema': return 'outline';
      case 'infographic': return 'destructive';
      case 'chart': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {illustrations.map((illustration) => (
          <div
            key={illustration.id}
            className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => setSelectedIllustration(illustration)}
          >
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-3 relative overflow-hidden">
              {illustration.url.endsWith('.svg') ? (
                <img 
                  src={illustration.url} 
                  alt={illustration.alt}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <span className="text-2xl mb-2">{getTypeIcon(illustration.type)}</span>
                <p className="text-sm text-center">{illustration.title}</p>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant={getTypeBadgeVariant(illustration.type)} className="text-xs">
                  {illustration.type}
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2">
                <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                  <Maximize2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{illustration.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {illustration.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog de visualisation */}
      <Dialog open={!!selectedIllustration} onOpenChange={() => setSelectedIllustration(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedIllustration && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedIllustration.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedIllustration.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getTypeBadgeVariant(selectedIllustration.type)}>
                    {selectedIllustration.type}
                  </Badge>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIllustration(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4 max-h-[60vh] overflow-auto">
                {selectedIllustration.url.endsWith('.svg') ? (
                  <img 
                    src={selectedIllustration.url} 
                    alt={selectedIllustration.alt}
                    className="w-full h-auto max-w-full"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">{getTypeIcon(selectedIllustration.type)}</span>
                      <p>{selectedIllustration.title}</p>
                      <p className="text-sm mt-2">Illustration non disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
