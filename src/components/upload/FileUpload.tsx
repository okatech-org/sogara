import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Image, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Interface pour les fichiers uploadés
export interface UploadedFile {
  id: string;
  file: File;
  url?: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en bytes
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<string[]>; // Retourne les URLs
  onRemove?: (fileId: string) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
  showPreview?: boolean;
}

export function FileUpload({
  accept = 'image/*,.pdf,.doc,.docx',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB par défaut
  maxFiles = 5,
  onUpload,
  onRemove,
  disabled = false,
  className,
  title = 'Déposer vos fichiers ici',
  description = 'ou cliquez pour sélectionner',
  showPreview = true
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Configuration du drag & drop
  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled) return;

    // Gérer les fichiers rejetés
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          let message = 'Fichier rejeté';
          
          switch (error.code) {
            case 'file-too-large':
              message = `Fichier trop volumineux (max: ${formatFileSize(maxSize)})`;
              break;
            case 'file-invalid-type':
              message = 'Type de fichier non autorisé';
              break;
            case 'too-many-files':
              message = `Trop de fichiers (max: ${maxFiles})`;
              break;
          }
          
          toast({
            title: 'Fichier rejeté',
            description: `${file.name}: ${message}`,
            variant: 'destructive'
          });
        });
      });
    }

    if (acceptedFiles.length === 0) return;

    // Vérifier le nombre total de fichiers
    if (!multiple && uploadedFiles.length > 0) {
      setUploadedFiles([]);
    }

    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast({
        title: 'Trop de fichiers',
        description: `Maximum ${maxFiles} fichiers autorisés`,
        variant: 'destructive'
      });
      return;
    }

    // Initialiser les fichiers avec un statut "uploading"
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: generateFileId(),
      file,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    try {
      // Simuler la progression et uploader
      await Promise.all(newFiles.map(uploadFile));
      
      // Appeler la fonction onUpload avec tous les fichiers
      const urls = await onUpload(acceptedFiles);
      
      // Mettre à jour avec les URLs
      setUploadedFiles(prev => prev.map((file, index) => {
        const newFileIndex = prev.length - newFiles.length + index;
        if (newFileIndex >= 0 && newFileIndex < urls.length) {
          return {
            ...file,
            url: urls[newFileIndex],
            status: 'success',
            progress: 100
          };
        }
        return file;
      }));

      toast({
        title: 'Upload réussi',
        description: `${acceptedFiles.length} fichier(s) uploadé(s) avec succès`
      });

    } catch (error) {
      console.error('Erreur upload:', error);
      
      // Marquer les fichiers en erreur
      setUploadedFiles(prev => prev.map(file => 
        newFiles.some(nf => nf.id === file.id)
          ? { ...file, status: 'error', error: error instanceof Error ? error.message : 'Erreur inconnue' }
          : file
      ));
      
      toast({
        title: 'Erreur d\'upload',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles, maxFiles, maxSize, multiple, onUpload, disabled]);

  // Simuler l'upload avec progression
  const uploadFile = async (uploadedFile: UploadedFile): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        
        setUploadedFiles(prev => prev.map(file => 
          file.id === uploadedFile.id ? { ...file, progress } : file
        ));
      }, 200);
    });
  };

  // Configuration react-dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
    maxSize,
    maxFiles,
    disabled: disabled || isUploading
  });

  // Supprimer un fichier
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    onRemove?.(fileId);
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Générer un ID unique pour les fichiers
  const generateFileId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Zone de drop */}
      <Card className={cn(
        'border-2 border-dashed transition-colors cursor-pointer',
        isDragActive && 'border-primary bg-primary/5',
        isDragAccept && 'border-green-500 bg-green-50',
        isDragReject && 'border-destructive bg-destructive/5',
        disabled && 'cursor-not-allowed opacity-50'
      )}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="text-center space-y-4"
          >
            <input {...getInputProps()} />
            
            <div className="flex justify-center">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                <Upload className="w-8 h-8" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Max: {formatFileSize(maxSize)} • {multiple ? `Jusqu'à ${maxFiles} fichiers` : '1 fichier'}
              </p>
            </div>
            
            {!isDragActive && (
              <Button variant="outline" disabled={disabled}>
                Choisir des fichiers
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des fichiers */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            Fichiers ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="p-3">
                <div className="flex items-center gap-3">
                  {/* Icône et nom */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(uploadedFile.file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="flex items-center gap-2">
                    {uploadedFile.status === 'uploading' && (
                      <div className="flex items-center gap-2">
                        <Progress value={uploadedFile.progress} className="w-20" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(uploadedFile.progress)}%
                        </span>
                      </div>
                    )}
                    
                    {uploadedFile.status === 'success' && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Réussi
                      </Badge>
                    )}
                    
                    {uploadedFile.status === 'error' && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Erreur
                      </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {uploadedFile.url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(uploadedFile.url, '_blank')}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadedFile.id)}
                        disabled={uploadedFile.status === 'uploading'}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Erreur */}
                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <div className="mt-2 text-xs text-destructive">
                    {uploadedFile.error}
                  </div>
                )}

                {/* Preview pour les images */}
                {showPreview && uploadedFile.file.type.startsWith('image/') && uploadedFile.url && (
                  <div className="mt-3">
                    <img
                      src={uploadedFile.url}
                      alt={uploadedFile.file.name}
                      className="max-w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
