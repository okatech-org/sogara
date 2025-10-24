import { useState, useEffect, useMemo } from 'react';
import { useEmployees } from './useEmployees';
import { useIncidents } from './useHSE';
import { useVisits } from './useVisits';
import { usePackages } from './usePackages';
import { useEquipment } from './useEquipment';

interface StrategicKPI {
  title: string;
  value: string | number;
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: '7j' | '30j' | '12m';
  };
  status: 'critical' | 'warning' | 'healthy';
  action?: string;
  icon: string;
  color: string;
}

interface CriticalAlert {
  id: string;
  title: string;
  description: string;
  category: 'audit' | 'training' | 'incident' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  dueDate: Date;
  actionRequired: boolean;
  action?: { label: string; route: string };
}

interface FinancialKPIs {
  costPerEmployee: {
    value: number;
    currency: 'FCFA' | 'EUR';
    variance: { vs_budget: number; vs_lastYear: number };
    breakdown: { salary: number; benefits: number; training: number };
  };
  mappingROI: {
    investmentYTD: number;
    competenciesAcquired: number;
    projectedSavings: number;
    byCategory: { technical: number; safety: number; management: number };
  };
  automationSavings: {
    manualHoursSaved: number;
    equivalentCost: number;
    systems: Array<{ name: string; savings: number }>;
  };
  payrollProjection12m: {
    currentBudget: number;
    projectedExpense: number;
    variance: number;
    monthlyBreakdown: number[];
  };
}

interface PredictiveAnalytics {
  incidents: {
    historical: number[];
    forecast: number[];
    trendLine: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
    recommendation: string;
  };
  workforce: {
    currentHeadcount: number;
    projection12m: number[];
    retirements: number;
    recruitment: number;
  };
  compliance: {
    trainingsScheduled: number;
    trainingsCompleted: number;
    forecasted: number[];
    riskZones: string[];
  };
}

export function useDirectorGeneralData() {
  const { employees, loading: employeesLoading } = useEmployees();
  const { incidents, loading: incidentsLoading } = useIncidents();
  const { visits, loading: visitsLoading } = useVisits();
  const { packages, loading: packagesLoading } = usePackages();
  const { equipment, loading: equipmentLoading } = useEquipment();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = employeesLoading || incidentsLoading || visitsLoading || packagesLoading || equipmentLoading;

  // Calcul des KPIs stratégiques
  const strategicKPIs = useMemo((): StrategicKPI[] => {
    if (loading) return [];

    const totalEmployees = employees.length;
    const activeIncidents = incidents.filter(i => i.status === 'open').length;
    const monthlyVisits = visits.filter(v => {
      const visitDate = new Date(v.checkIn);
      const now = new Date();
      return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
    }).length;
    const operationalEquipment = equipment.filter(e => e.status === 'operational').length;

    // Calcul de la performance opérationnelle (simulation)
    const operationalEfficiency = Math.min(100, Math.max(0, 85 + (operationalEquipment / equipment.length) * 15));

    // Calcul de la conformité HSE (simulation)
    const hseCompliance = Math.min(100, Math.max(0, 90 - (activeIncidents * 2)));

    // Calcul de la productivité RH (simulation)
    const workforceProductivity = Math.min(100, Math.max(0, 80 + (totalEmployees / 10)));

    // Calcul des risques critiques (simulation)
    const criticalRisks = activeIncidents + (totalEmployees > 50 ? 1 : 0);

    return [
      {
        title: "Performance Opérationnelle",
        value: `${operationalEfficiency.toFixed(1)}%`,
        trend: { direction: 'up', percentage: 3.2, period: '30j' },
        status: operationalEfficiency > 85 ? 'healthy' : operationalEfficiency > 70 ? 'warning' : 'critical',
        action: '/app/operations',
        icon: 'TrendingUp',
        color: 'text-green-600'
      },
      {
        title: "Conformité HSE",
        value: `${hseCompliance.toFixed(1)}%`,
        trend: { direction: 'up', percentage: 1.8, period: '30j' },
        status: hseCompliance > 90 ? 'healthy' : hseCompliance > 80 ? 'warning' : 'critical',
        action: '/app/hsse-overview',
        icon: 'Shield',
        color: 'text-blue-600'
      },
      {
        title: "Effectifs Actifs",
        value: totalEmployees.toString(),
        trend: { direction: 'stable', percentage: 0, period: '30j' },
        status: 'healthy',
        action: '/app/personnel',
        icon: 'Users',
        color: 'text-purple-600'
      },
      {
        title: "Risques Critiques",
        value: criticalRisks.toString(),
        trend: { direction: 'down', percentage: 50, period: '30j' },
        status: criticalRisks === 0 ? 'healthy' : criticalRisks < 3 ? 'warning' : 'critical',
        action: '/app/incidents',
        icon: 'AlertTriangle',
        color: 'text-red-600'
      }
    ];
  }, [employees, incidents, visits, equipment, loading]);

  // Génération des alertes critiques
  const criticalAlerts = useMemo((): CriticalAlert[] => {
    if (loading) return [];

    const alerts: CriticalAlert[] = [];

    // Alertes basées sur les incidents
    const highSeverityIncidents = incidents.filter(i => i.severity === 'high' || i.severity === 'critical');
    if (highSeverityIncidents.length > 0) {
      alerts.push({
        id: 'incident-alert',
        title: 'Incidents critiques détectés',
        description: `${highSeverityIncidents.length} incident(s) de haute sévérité nécessitent une attention immédiate`,
        category: 'incident',
        severity: 'critical',
        owner: 'HSE001',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        actionRequired: true,
        action: { label: 'Voir incidents', route: '/app/incidents' }
      });
    }

    // Alertes basées sur les formations (simulation)
    const expiredTrainings = Math.floor(Math.random() * 10) + 5; // Simulation
    if (expiredTrainings > 0) {
      alerts.push({
        id: 'training-alert',
        title: 'Formations HSE expirées',
        description: `${expiredTrainings} employé(s) ont des formations HSE expirées`,
        category: 'training',
        severity: 'high',
        owner: 'HSE001',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        actionRequired: true,
        action: { label: 'Programmer formations', route: '/app/formations' }
      });
    }

    // Alertes basées sur les audits (simulation)
    const upcomingAudit = Math.random() > 0.5;
    if (upcomingAudit) {
      alerts.push({
        id: 'audit-alert',
        title: 'Audit qualité prévu',
        description: 'Audit ISO 9001 programmé pour le 15 novembre',
        category: 'audit',
        severity: 'medium',
        owner: 'QUAL001',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
        actionRequired: true,
        action: { label: 'Préparer audit', route: '/app/audits' }
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [incidents, loading]);

  // Calcul des KPIs financiers
  const financialKPIs = useMemo((): FinancialKPIs => {
    if (loading) return {
      costPerEmployee: { value: 0, currency: 'FCFA', variance: { vs_budget: 0, vs_lastYear: 0 }, breakdown: { salary: 0, benefits: 0, training: 0 } },
      mappingROI: { investmentYTD: 0, competenciesAcquired: 0, projectedSavings: 0, byCategory: { technical: 0, safety: 0, management: 0 } },
      automationSavings: { manualHoursSaved: 0, equivalentCost: 0, systems: [] },
      payrollProjection12m: { currentBudget: 0, projectedExpense: 0, variance: 0, monthlyBreakdown: [] }
    };

    const totalEmployees = employees.length;
    const baseSalary = 500000; // 500,000 FCFA par employé
    const totalPayroll = totalEmployees * baseSalary;

    return {
      costPerEmployee: {
        value: baseSalary,
        currency: 'FCFA',
        variance: { vs_budget: 5.2, vs_lastYear: -2.1 },
        breakdown: { salary: baseSalary * 0.8, benefits: baseSalary * 0.15, training: baseSalary * 0.05 }
      },
      mappingROI: {
        investmentYTD: 2500000,
        competenciesAcquired: 45,
        projectedSavings: 5000000,
        byCategory: { technical: 60, safety: 25, management: 15 }
      },
      automationSavings: {
        manualHoursSaved: 120,
        equivalentCost: 1500000,
        systems: [
          { name: 'Gestion des visites', savings: 600000 },
          { name: 'Suivi HSE', savings: 400000 },
          { name: 'Planning RH', savings: 500000 }
        ]
      },
      payrollProjection12m: {
        currentBudget: totalPayroll,
        projectedExpense: totalPayroll * 1.03, // 3% d'inflation
        variance: 3.0,
        monthlyBreakdown: Array(12).fill(0).map(() => totalPayroll * (1 + Math.random() * 0.02))
      }
    };
  }, [employees, loading]);

  // Calcul des analytics prédictives
  const predictiveAnalytics = useMemo((): PredictiveAnalytics => {
    if (loading) return {
      incidents: { historical: [], forecast: [], trendLine: 'stable', confidence: 0, recommendation: '' },
      workforce: { currentHeadcount: 0, projection12m: [], retirements: 0, recruitment: 0 },
      compliance: { trainingsScheduled: 0, trainingsCompleted: 0, forecasted: [], riskZones: [] }
    };

    const totalEmployees = employees.length;
    const totalIncidents = incidents.length;

    return {
      incidents: {
        historical: Array(12).fill(0).map(() => Math.floor(Math.random() * 10) + 2),
        forecast: Array(6).fill(0).map(() => Math.floor(Math.random() * 8) + 1),
        trendLine: totalIncidents > 20 ? 'increasing' : totalIncidents < 10 ? 'decreasing' : 'stable',
        confidence: 78,
        recommendation: totalIncidents > 20 ? 'Renforcer les mesures de prévention' : 'Maintenir les efforts actuels'
      },
      workforce: {
        currentHeadcount: totalEmployees,
        projection12m: Array(12).fill(0).map((_, i) => totalEmployees + Math.floor(Math.random() * 3) - 1),
        retirements: Math.floor(totalEmployees * 0.05),
        recruitment: Math.floor(totalEmployees * 0.08)
      },
      compliance: {
        trainingsScheduled: Math.floor(totalEmployees * 0.3),
        trainingsCompleted: Math.floor(totalEmployees * 0.7),
        forecasted: Array(6).fill(0).map(() => Math.floor(Math.random() * 20) + 80),
        riskZones: ['Formations HSE', 'Audits qualité', 'Équipements de sécurité']
      }
    };
  }, [employees, incidents, loading]);

  return {
    strategicKPIs,
    criticalAlerts,
    financialKPIs,
    predictiveAnalytics,
    loading,
    error,
    summary: {
      totalEmployees: employees.length,
      activeIncidents: incidents.filter(i => i.status === 'open').length,
      monthlyVisits: visits.filter(v => {
        const visitDate = new Date(v.checkIn);
        const now = new Date();
        return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
      }).length,
      equipmentOperational: equipment.filter(e => e.status === 'operational').length
    }
  };
}