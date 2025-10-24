import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AppContext';

interface ApprovalWorkflow {
  id: string;
  type: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  currentStep: number;
  totalSteps: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApprovalStep {
  id: string;
  stepNumber: number;
  stepName: string;
  approver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments?: string;
  approvedAt?: string;
  dueDate?: string;
  isRequired: boolean;
  canDelegate: boolean;
}

export function useApprovalWorkflows() {
  const { isAuthenticated } = useAuth();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [pendingSteps, setPendingSteps] = useState<ApprovalStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = async (filters?: {
    status?: string;
    type?: string;
    priority?: string;
  }) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.priority) params.append('priority', filters.priority);

      const response = await fetch(`/api/approval/workflows?${params}`);
      const data = await response.json();

      if (data.success) {
        setWorkflows(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur récupération workflows:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingSteps = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/approval/pending');
      const data = await response.json();

      if (data.success) {
        setPendingSteps(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur récupération étapes en attente:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (workflowData: {
    type: string;
    title: string;
    description: string;
    priority: string;
    workflowData: any;
    approvers: Array<{
      stepName: string;
      approverId: string;
      dueDate?: string;
      isRequired?: boolean;
      canDelegate?: boolean;
    }>;
  }) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/approval/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchWorkflows();
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur création workflow:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createHSEWorkflow = async (hseWorkflowData: {
    incidentId?: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    supervisorId: string;
    hseManagerId: string;
    directorId?: string;
  }) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/approval/hse-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hseWorkflowData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchWorkflows();
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur création workflow HSE:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const approveStep = async (stepId: string, decision: {
    decision: 'approved' | 'rejected';
    comments?: string;
  }) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/approval/step/${stepId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(decision)
      });

      const data = await response.json();

      if (data.success) {
        await fetchPendingSteps();
        await fetchWorkflows();
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur approbation étape:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const delegateApproval = async (stepId: string, delegation: {
    delegateToId: string;
    reason: string;
  }) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/approval/step/${stepId}/delegate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(delegation)
      });

      const data = await response.json();

      if (data.success) {
        await fetchPendingSteps();
        await fetchWorkflows();
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur délégation approbation:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowHistory = async (workflowId: string) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/approval/workflow/${workflowId}/history`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur récupération historique workflow:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkflows();
      fetchPendingSteps();
    }
  }, [isAuthenticated]);

  return {
    workflows,
    pendingSteps,
    loading,
    error,
    fetchWorkflows,
    fetchPendingSteps,
    createWorkflow,
    createHSEWorkflow,
    approveStep,
    delegateApproval,
    getWorkflowHistory
  };
}
