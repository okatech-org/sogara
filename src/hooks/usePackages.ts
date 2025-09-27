import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { PackageMail, PackageStatus } from '@/types';
import { toast } from '@/hooks/use-toast';

export function usePackages() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const packages = repositories.packages.getAll();
    dispatch({ type: 'SET_PACKAGES', payload: packages });
  }, [dispatch]);

  const createPackage = (packageData: Omit<PackageMail, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPackage = repositories.packages.create(packageData);
      dispatch({ type: 'ADD_PACKAGE', payload: newPackage });
      
      repositories.notifications.create({
        type: newPackage.priority === 'urgent' ? 'urgent' : 'info',
        title: `Nouveau ${newPackage.type === 'package' ? 'colis' : 'courrier'}`,
        message: `${newPackage.type === 'package' ? 'Colis' : 'Courrier'} reçu de ${newPackage.sender}`,
        metadata: { packageId: newPackage.id },
      });

      toast({
        title: 'Enregistré',
        description: `${newPackage.type === 'package' ? 'Colis' : 'Courrier'} ajouté avec succès.`,
      });
      return newPackage;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le colis/courrier.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePackageStatus = (packageId: string, status: PackageStatus, deliveredBy?: string) => {
    try {
      const updates: Partial<PackageMail> = { status };
      
      if (status === 'delivered') {
        updates.deliveredAt = new Date();
        updates.deliveredBy = deliveredBy;
      }

      const updatedPackage = repositories.packages.update(packageId, updates);
      if (updatedPackage) {
        dispatch({ type: 'UPDATE_PACKAGE', payload: updatedPackage });
        
        const statusMessages = {
          received: 'Reçu',
          stored: 'En stock',
          delivered: 'Remis au destinataire',
        };
        
        toast({
          title: 'Statut mis à jour',
          description: `${updatedPackage.type === 'package' ? 'Colis' : 'Courrier'} ${statusMessages[status].toLowerCase()}`,
        });
        return updatedPackage;
      }
      return null;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getPendingPackages = () => {
    return state.packages.filter(pkg => pkg.status !== 'delivered');
  };

  const getUrgentPackages = () => {
    return state.packages.filter(pkg => 
      pkg.priority === 'urgent' && pkg.status !== 'delivered'
    );
  };

  const getPackagesByEmployee = (employeeId: string) => {
    return state.packages.filter(pkg => pkg.recipientEmployeeId === employeeId);
  };

  const getPackageById = (id: string) => {
    return state.packages.find(pkg => pkg.id === id);
  };

  return {
    packages: state.packages,
    createPackage,
    updatePackageStatus,
    getPendingPackages,
    getUrgentPackages,
    getPackagesByEmployee,
    getPackageById,
  };
}