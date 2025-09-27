import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  variant?: 'destructive' | 'warning';
}

export function DeleteConfirmDialog({
  trigger,
  title,
  description,
  itemName = 'cet élément',
  onConfirm,
  isLoading = false,
  variant = 'destructive'
}: DeleteConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultTitle = variant === 'destructive' 
    ? 'Confirmer la suppression' 
    : 'Confirmer l\'action';

  const defaultDescription = variant === 'destructive'
    ? `Êtes-vous sûr de vouloir supprimer ${itemName} ? Cette action est irréversible.`
    : `Êtes-vous sûr de vouloir effectuer cette action sur ${itemName} ?`;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${
              variant === 'destructive' ? 'text-destructive' : 'text-warning'
            }`} />
            {title || defaultTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting || isLoading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || isLoading}
            className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isDeleting ? 'Suppression...' : 'Confirmer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
