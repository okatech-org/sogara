import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { PackageMail, PackageStatus, Priority } from '@/types';
import { toast } from '@/hooks/use-toast';
import { convex, convexClientAvailable } from '@/lib/convexClient';

export function usePackages() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (convexClientAvailable) {
          const res = await convex.query('packages:list', {});
          if (!cancelled && Array.isArray(res)) {
            const mapped = res.map((p: any) => ({
              id: String(p._id ?? p.id),
              type: p.type,
              priority: p.priority,
              status: p.status as PackageStatus,
              sender: p.sender,
              recipientEmployeeId: p.recipientEmployeeId ? String(p.recipientEmployeeId) : undefined,
              reference: p.reference,
              photoUrl: p.photoUrl,
              description: p.description,
              receivedAt: new Date(p.receivedAt ?? p.createdAt ?? Date.now()),
              deliveredAt: p.deliveredAt ? new Date(p.deliveredAt) : undefined,
              deliveredBy: p.deliveredBy,
              createdAt: new Date(p.createdAt ?? Date.now()),
              updatedAt: new Date(p.updatedAt ?? Date.now()),
            })) as PackageMail[];
            dispatch({ type: 'SET_PACKAGES', payload: mapped });
            return;
          }
        }
      } catch (_) {}
      const local = repositories.packages.getAll();
      if (!cancelled) dispatch({ type: 'SET_PACKAGES', payload: local });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const createPackage = async (packageData: Omit<PackageMail, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (convexClientAvailable) {
        const created = await convex.mutation('packages:create', packageData);
        if (created) {
          const mapped: PackageMail = {
            id: String(created._id ?? created.id),
            type: created.type,
            priority: created.priority,
            status: created.status as PackageStatus,
            sender: created.sender,
            recipientEmployeeId: created.recipientEmployeeId ? String(created.recipientEmployeeId) : undefined,
            reference: created.reference,
            photoUrl: created.photoUrl,
            description: created.description,
            receivedAt: new Date(created.receivedAt ?? created.createdAt ?? Date.now()),
            deliveredAt: created.deliveredAt ? new Date(created.deliveredAt) : undefined,
            deliveredBy: created.deliveredBy,
            createdAt: new Date(created.createdAt ?? Date.now()),
            updatedAt: new Date(created.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'ADD_PACKAGE', payload: mapped });
          toast({ title: 'Enregistré', description: `${mapped.type === 'package' ? 'Colis' : 'Courrier'} ajouté avec succès.` });
          return mapped;
        }
      }
      const newPackage = repositories.packages.create({
        ...packageData,
        type: 'package',
      });
      dispatch({ type: 'ADD_PACKAGE', payload: newPackage });
      repositories.notifications.create({
        type: newPackage.priority === 'urgent' ? 'urgent' : 'info',
        title: `Nouveau ${newPackage.type === 'package' ? 'colis' : 'courrier'}`,
        message: `${newPackage.type === 'package' ? 'Colis' : 'Courrier'} reçu de ${newPackage.sender}`,
        metadata: { packageId: newPackage.id },
      });
      toast({ title: 'Enregistré', description: `${newPackage.type === 'package' ? 'Colis' : 'Courrier'} ajouté avec succès.` });
      return newPackage;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer le colis/courrier.', variant: 'destructive' });
      throw error;
    }
  };

  const createMail = async (input: {
    reference: string;
    sender: string;
    recipientEmployeeId?: string;
    recipientService?: string;
    description: string;
    priority: Priority;
    isConfidential: boolean;
    scannedFileUrls?: string[];
    photoUrl?: string;
  }) => {
    try {
      const baseData: Omit<PackageMail, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'mail',
        reference: input.reference,
        sender: input.sender,
        recipientEmployeeId: input.recipientEmployeeId,
        recipientService: input.recipientService,
        description: input.description,
        photoUrl: input.photoUrl,
        isConfidential: input.isConfidential,
        scannedFileUrls: input.scannedFileUrls,
        priority: input.priority,
        status: 'received',
        receivedAt: new Date(),
      } as any;

      if (convexClientAvailable) {
        const created = await convex.mutation('packages:create', baseData);
        if (created) {
          const mapped: PackageMail = {
            id: String(created._id ?? created.id),
            type: created.type,
            priority: created.priority,
            status: created.status as PackageStatus,
            sender: created.sender,
            recipientEmployeeId: created.recipientEmployeeId ? String(created.recipientEmployeeId) : undefined,
            recipientService: created.recipientService,
            reference: created.reference,
            photoUrl: created.photoUrl,
            description: created.description,
            isConfidential: created.isConfidential,
            scannedFileUrls: created.scannedFileUrls,
            receivedAt: new Date(created.receivedAt ?? created.createdAt ?? Date.now()),
            deliveredAt: created.deliveredAt ? new Date(created.deliveredAt) : undefined,
            deliveredBy: created.deliveredBy,
            createdAt: new Date(created.createdAt ?? Date.now()),
            updatedAt: new Date(created.updatedAt ?? Date.now()),
          } as PackageMail;
          dispatch({ type: 'ADD_PACKAGE', payload: mapped });
          toast({ title: 'Enregistré', description: 'Courrier ajouté avec succès.' });
          return mapped;
        }
      }

      const newMail = repositories.packages.create(baseData);
      dispatch({ type: 'ADD_PACKAGE', payload: newMail });

      if (!input.isConfidential && input.scannedFileUrls && input.scannedFileUrls.length > 0) {
        const ownerType = input.recipientEmployeeId ? 'employee' : 'service';
        const ownerIdOrService = input.recipientEmployeeId || input.recipientService;
        const ts = new Date();
        input.scannedFileUrls.forEach((url, idx) => {
          repositories.documents.create({
            ownerType: ownerType as any,
            ownerId: ownerType === 'employee' ? ownerIdOrService : undefined,
            serviceName: ownerType === 'service' ? ownerIdOrService : undefined,
            source: 'mail',
            name: `Courrier ${input.reference} - pièce ${idx + 1}`,
            url,
            mailId: newMail.id,
          });
        });
      }

      repositories.notifications.create({
        type: input.priority === 'urgent' ? 'urgent' : 'info',
        title: 'Nouveau courrier',
        message: `${input.isConfidential ? 'Confidentiel' : 'Numérisé'} pour ${input.recipientEmployeeId ? 'employé' : 'service'}`,
        metadata: { packageId: newMail.id, recipientEmployeeId: input.recipientEmployeeId, recipientService: input.recipientService },
      });

      toast({ title: 'Enregistré', description: 'Courrier ajouté avec succès.' });
      return newMail;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer le courrier.', variant: 'destructive' });
      throw error;
    }
  };

  const updatePackageStatus = async (packageId: string, status: PackageStatus, deliveredBy?: string) => {
    try {
      const updates: Partial<PackageMail> = { status };
      if (status === 'delivered') {
        updates.deliveredAt = new Date();
        updates.deliveredBy = deliveredBy;
      }
      if (convexClientAvailable) {
        const updated = await convex.mutation('packages:updateStatus', { id: packageId, status, deliveredBy });
        if (updated) {
          const mapped: PackageMail = {
            id: String(updated._id ?? updated.id),
            type: updated.type,
            priority: updated.priority,
            status: updated.status as PackageStatus,
            sender: updated.sender,
            recipientEmployeeId: updated.recipientEmployeeId ? String(updated.recipientEmployeeId) : undefined,
            reference: updated.reference,
            photoUrl: updated.photoUrl,
            description: updated.description,
            receivedAt: new Date(updated.receivedAt ?? updated.createdAt ?? Date.now()),
            deliveredAt: updated.deliveredAt ? new Date(updated.deliveredAt) : undefined,
            deliveredBy: updated.deliveredBy,
            createdAt: new Date(updated.createdAt ?? Date.now()),
            updatedAt: new Date(updated.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'UPDATE_PACKAGE', payload: mapped });
          const statusMessages = { received: 'Reçu', stored: 'En stock', delivered: 'Remis au destinataire' } as const;
          toast({ title: 'Statut mis à jour', description: `${mapped.type === 'package' ? 'Colis' : 'Courrier'} ${statusMessages[status].toLowerCase()}` });
          return mapped;
        }
      }
      const updatedPackage = repositories.packages.update(packageId, updates);
      if (updatedPackage) {
        dispatch({ type: 'UPDATE_PACKAGE', payload: updatedPackage });
        const statusMessages = { received: 'Reçu', stored: 'En stock', delivered: 'Remis au destinataire' } as const;
        toast({ title: 'Statut mis à jour', description: `${updatedPackage.type === 'package' ? 'Colis' : 'Courrier'} ${statusMessages[status].toLowerCase()}` });
      }
      return updatedPackage;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'destructive' });
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
    createMail,
    updatePackageStatus,
    getPendingPackages,
    getUrgentPackages,
    getPackagesByEmployee,
    getPackageById,
  };
}