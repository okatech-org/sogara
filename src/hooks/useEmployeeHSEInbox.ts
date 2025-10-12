import { useMemo, useCallback } from 'react';
import { useHSEContent } from './useHSEContent';
import { HSEAssignment, HSEContentItem } from '@/types';

export function useEmployeeHSEInbox(employeeId: string) {
  const { assignments, content, updateAssignmentStatus } = useHSEContent();

  const myAssignments = useMemo(() => {
    return assignments
      .filter(a => a.employeeId === employeeId)
      .sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime());
  }, [assignments, employeeId]);

  const myTrainings = useMemo(() => {
    return myAssignments.filter(a => a.contentType === 'training');
  }, [myAssignments]);

  const myAlerts = useMemo(() => {
    return myAssignments.filter(a => 
      a.contentType === 'alert' || a.contentType === 'info' || a.contentType === 'reminder'
    );
  }, [myAssignments]);

  const myDocuments = useMemo(() => {
    return myAssignments.filter(a => 
      a.contentType === 'document' || a.contentType === 'procedure'
    );
  }, [myAssignments]);

  const unreadCount = useMemo(() => {
    return myAssignments.filter(a => 
      a.status === 'sent' || a.status === 'received'
    ).length;
  }, [myAssignments]);

  const pendingTrainings = useMemo(() => {
    return myTrainings.filter(a => 
      a.status !== 'completed' && a.status !== 'expired'
    );
  }, [myTrainings]);

  const completedTrainings = useMemo(() => {
    return myTrainings.filter(a => a.status === 'completed');
  }, [myTrainings]);

  const acknowledgeItem = useCallback((assignmentId: string) => {
    updateAssignmentStatus(assignmentId, 'acknowledged', {
      acknowledgedAt: new Date()
    });
  }, [updateAssignmentStatus]);

  const markAsRead = useCallback((assignmentId: string) => {
    updateAssignmentStatus(assignmentId, 'read', {
      readAt: new Date()
    });
  }, [updateAssignmentStatus]);

  const startTraining = useCallback((assignmentId: string) => {
    updateAssignmentStatus(assignmentId, 'in_progress', {
      startedAt: new Date()
    });
  }, [updateAssignmentStatus]);

  const completeTraining = useCallback((assignmentId: string, score: number, certificate?: string) => {
    updateAssignmentStatus(assignmentId, 'completed', {
      completedAt: new Date(),
      score,
      certificate,
      progress: 100
    });
  }, [updateAssignmentStatus]);

  const updateProgress = useCallback((assignmentId: string, progress: number) => {
    const assignment = myAssignments.find(a => a.id === assignmentId);
    if (assignment) {
      updateAssignmentStatus(assignmentId, 'in_progress', { progress });
    }
  }, [myAssignments, updateAssignmentStatus]);

  const getContentForAssignment = useCallback((assignment: HSEAssignment): HSEContentItem | undefined => {
    return content.find(c => c.id === assignment.contentId);
  }, [content]);

  const complianceRate = useMemo(() => {
    if (myTrainings.length === 0) return 100;
    const completed = completedTrainings.length;
    return Math.round((completed / myTrainings.length) * 100);
  }, [myTrainings.length, completedTrainings.length]);

  return {
    myAssignments,
    myTrainings,
    myAlerts,
    myDocuments,
    unreadCount,
    pendingTrainings,
    completedTrainings,
    complianceRate,
    acknowledgeItem,
    markAsRead,
    startTraining,
    completeTraining,
    updateProgress,
    getContentForAssignment
  };
}

