import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AppContext';

interface AnalyticsData {
  metrics: {
    [key: string]: {
      [metric: string]: Array<{
        value: number;
        date: string;
        metadata?: any;
      }>;
    };
  };
  kpis: {
    hse?: {
      incidentsTotal: number;
      incidentsResolved: number;
      complianceRate: number;
      trainingCompletion: number;
    };
    visits?: {
      totalToday: number;
      averageDuration: number;
      completionRate: number;
    };
    packages?: {
      totalReceived: number;
      deliveredOnTime: number;
      deliveryRate: number;
    };
  };
  trends: {
    [metric: string]: {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    };
  };
  complianceRatios: {
    total: number;
    compliant: number;
    ratio: number;
  };
}

export function useAnalytics() {
  const { isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = async (period: string = 'monthly', department?: string) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ period });
      if (department && department !== 'all') {
        params.append('department', department);
      }

      const response = await fetch(`/api/analytics/dashboard?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur récupération métriques dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchHSEAnalytics = async (period: string = 'monthly', type?: string) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ period });
      if (type) {
        params.append('type', type);
      }

      const response = await fetch(`/api/analytics/hse?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur récupération analytics HSE:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeMetrics = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/realtime');
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur récupération métriques temps réel:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createMetric = async (metricData: {
    type: string;
    metric: string;
    value: number;
    period: string;
    metadata?: any;
    department?: string;
  }) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/metric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metricData)
      });

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Erreur création métrique:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyticsData,
    loading,
    error,
    fetchDashboardMetrics,
    fetchHSEAnalytics,
    fetchRealTimeMetrics,
    createMetric
  };
}
