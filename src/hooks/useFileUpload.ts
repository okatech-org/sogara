import { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from '@/hooks/use-toast';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const uploadFile = async (file: File): Promise<{ success: boolean; storageId?: string; error?: string }> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Générer une URL d'upload
      const uploadUrl = await generateUploadUrl();

      if (!uploadUrl) {
        throw new Error("Impossible de générer l'URL d'upload");
      }

      setUploadProgress(30);

      // 2. Uploader le fichier
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Échec de l'upload du fichier");
      }

      setUploadProgress(70);

      // 3. Récupérer le storageId
      const { storageId } = await result.json();

      setUploadProgress(100);

      toast({
        title: 'Fichier uploadé',
        description: `${file.name} a été téléchargé avec succès.`,
      });

      return { success: true, storageId };

    } catch (error: any) {
      console.error("Erreur upload fichier:", error);

      toast({
        title: 'Erreur d\'upload',
        description: error.message || 'Impossible de télécharger le fichier.',
        variant: 'destructive',
      });

      return { success: false, error: error.message };

    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<{ success: boolean; storageIds?: string[]; error?: string }> => {
    setIsUploading(true);
    const storageIds: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);

        const result = await uploadFile(file);

        if (!result.success || !result.storageId) {
          throw new Error(`Échec upload de ${file.name}`);
        }

        storageIds.push(result.storageId);
      }

      setUploadProgress(100);

      toast({
        title: 'Fichiers uploadés',
        description: `${files.length} fichier(s) téléchargé(s) avec succès.`,
      });

      return { success: true, storageIds };

    } catch (error: any) {
      toast({
        title: 'Erreur d\'upload',
        description: error.message || 'Impossible de télécharger les fichiers.',
        variant: 'destructive',
      });

      return { success: false, error: error.message };

    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    uploadProgress,
  };
}

