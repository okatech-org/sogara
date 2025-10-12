import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PackageMail, PackageStatus, Priority } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Id } from "../../convex/_generated/dataModel";

export function usePackages() {
  // Queries Convex
  const packagesData = useQuery(api.packages.list);

  // Mutations Convex
  const createPackageMutation = useMutation(api.packages.create);
  const updatePackageMutation = useMutation(api.packages.update);
  const deliverMutation = useMutation(api.packages.deliver);

  // Mapper les données Convex
  const packages: PackageMail[] = (packagesData || []).map((p: any) => ({
    id: p._id,
    type: p.type,
    reference: p.reference,
    sender: p.sender,
    recipientEmployeeId: p.recipientEmployeeId,
    recipientService: p.recipientService,
    description: p.description,
    photoUrl: p.photoUrl,
    isConfidential: p.isConfidential,
    scannedFileUrls: p.scannedFileUrls,
    priority: p.priority,
    status: p.status,
    receivedAt: new Date(p.receivedAt),
    deliveredAt: p.deliveredAt ? new Date(p.deliveredAt) : undefined,
    deliveredBy: p.deliveredBy,
    signature: p.signature,
    createdAt: new Date(p._creationTime),
    updatedAt: new Date(p._creationTime),
  }));

  const createPackage = async (packageData: Omit<PackageMail, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createPackageMutation({
        type: packageData.type,
        reference: packageData.reference,
        sender: packageData.sender,
        recipientEmployeeId: packageData.recipientEmployeeId as Id<"employees"> | undefined,
        recipientService: packageData.recipientService,
        description: packageData.description,
        photoUrl: packageData.photoUrl,
        isConfidential: packageData.isConfidential || false,
        priority: packageData.priority,
        location: undefined,
        trackingNumber: undefined,
        weight: undefined,
        category: undefined,
      });

      toast({
        title: 'Enregistré',
        description: `${packageData.type === 'package' ? 'Colis' : 'Courrier'} ajouté avec succès.`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'enregistrer.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
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
      await createPackageMutation({
        type: 'mail',
        reference: input.reference,
        sender: input.sender,
        recipientEmployeeId: input.recipientEmployeeId as Id<"employees"> | undefined,
        recipientService: input.recipientService,
        description: input.description,
        photoUrl: input.photoUrl,
        isConfidential: input.isConfidential,
        priority: input.priority,
        location: undefined,
        trackingNumber: undefined,
        weight: undefined,
        category: undefined,
      });

      toast({
        title: 'Enregistré',
        description: 'Courrier ajouté avec succès.',
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'enregistrer le courrier.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  const updatePackageStatus = async (packageId: string, status: PackageStatus, deliveredBy?: string) => {
    try {
      if (status === 'delivered' && deliveredBy) {
        await deliverMutation({
          id: packageId as Id<"packages">,
          deliveredBy,
        });
      } else {
        await updatePackageMutation({
          id: packageId as Id<"packages">,
          status,
        });
      }

      const statusMessages = {
        received: 'Reçu',
        stored: 'En stock',
        delivered: 'Remis au destinataire',
      };

      const pkg = packages.find(p => p.id === packageId);
      toast({
        title: 'Statut mis à jour',
        description: `${pkg?.type === 'package' ? 'Colis' : 'Courrier'} ${statusMessages[status].toLowerCase()}`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le statut.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  const getPendingPackages = () => {
    return packages.filter(pkg => pkg.status !== 'delivered');
  };

  const getUrgentPackages = () => {
    return packages.filter(pkg => 
      pkg.priority === 'urgent' && pkg.status !== 'delivered'
    );
  };

  const getPackagesByEmployee = (employeeId: string) => {
    return packages.filter(pkg => pkg.recipientEmployeeId === employeeId);
  };

  const getPackageById = (id: string) => {
    return packages.find(pkg => pkg.id === id);
  };

  return {
    packages,
    isLoading: packagesData === undefined,
    createPackage,
    createMail,
    updatePackageStatus,
    getPendingPackages,
    getUrgentPackages,
    getPackagesByEmployee,
    getPackageById,
  };
}
