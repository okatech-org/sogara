export interface StrategicKPI {
  title: string;
  value: string | number;
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: '7j' | '30j' | '12m';
  };
  status: 'critical' | 'warning' | 'healthy';
  action?: string;
  icon?: React.ComponentType<any>;
  color?: string;
}

export interface CriticalAlert {
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

export interface FinancialKPIs {
  costPerEmployee: {
    value: number;
    currency: 'FCFA' | 'EUR';
    variance: { vs_budget: number; vs_lastYear: number };
    breakdown: { salary: number; benefits: number; training: number };
  };
  trainingROI: {
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

export interface PredictiveAnalytics {
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

export interface CriticalEvent {
  date: Date;
  title: string;
  category: 'audit' | 'training' | 'incident' | 'compliance' | 'decision';
  severity: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  status: 'pending' | 'in_progress' | 'completed';
  action?: string;
}

export interface ExecutiveReport {
  month: number;
  year: number;
  sections: {
    executive_summary: string;
    kpi_overview: StrategicKPI[];
    financial_analysis: FinancialKPIs;
    hse_status: { compliance: number; incidents: number };
    workforce_status: { headcount: number; turnover: number };
    risks: CriticalAlert[];
    recommendations: string[];
  };
  generatedAt: Date;
  generatedBy: string;
}

export interface SmartAlert {
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

export interface DomainData {
  RH: {
    headcount: number;
    turnover: number;
    payrollStatus: string;
    complianceRate: number;
  };
  HSE: {
    openIncidents: number;
    highSeverity: number;
    trainingsCompleted: number;
    auditFindings: number;
  };
  Operations: {
    visitorsAnnual: number;
    mailAnnual: number;
    equipmentOperational: number;
    maintenancePending: number;
  };
  Communication: {
    articles: number;
    audience: number;
    engagement: number;
    shares: number;
  };
}

export interface HeatmapRisk {
  domain: string;
  shortTerm: 'low' | 'medium' | 'high' | 'critical';
  mediumTerm: 'low' | 'medium' | 'high' | 'critical';
  longTerm: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface TrendData {
  label: string;
  value: number;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  forecast?: number;
}

export interface RiskMatrix {
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
}

export interface PerformanceMetrics {
  operational: {
    efficiency: number;
    quality: number;
    safety: number;
    compliance: number;
  };
  financial: {
    costPerEmployee: number;
    trainingROI: number;
    automationSavings: number;
    budgetVariance: number;
  };
  human: {
    headcount: number;
    turnover: number;
    satisfaction: number;
    development: number;
  };
}

export interface DashboardConfig {
  refreshInterval: number; // en millisecondes
  autoRefresh: boolean;
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  layout: 'compact' | 'comfortable' | 'spacious';
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    start: Date;
    end: Date;
  };
  sections: string[];
  includeCharts: boolean;
  includeAlerts: boolean;
}
