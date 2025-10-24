const Analytics = require('../models/Analytics.model');
const { Op } = require('sequelize');

class AnalyticsController {
  // Récupérer les métriques du dashboard direction
  async getDashboardMetrics(req, res) {
    try {
      const { period = 'monthly', department } = req.query;
      const startDate = this.getStartDate(period);
      
      const whereClause = {
        date: {
          [Op.gte]: startDate
        }
      };
      
      if (department) {
        whereClause.department = department;
      }

      const metrics = await Analytics.findAll({
        where: whereClause,
        order: [['date', 'DESC']]
      });

      // Grouper les métriques par type
      const groupedMetrics = metrics.reduce((acc, metric) => {
        if (!acc[metric.type]) {
          acc[metric.type] = {};
        }
        if (!acc[metric.type][metric.metric]) {
          acc[metric.type][metric.metric] = [];
        }
        acc[metric.type][metric.metric].push(metric);
        return acc;
      }, {});

      // Calculer les KPIs
      const kpis = this.calculateKPIs(groupedMetrics);

      res.json({
        success: true,
        data: {
          metrics: groupedMetrics,
          kpis,
          period,
          department
        }
      });
    } catch (error) {
      console.error('Erreur récupération métriques dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des métriques',
        error: error.message
      });
    }
  }

  // Récupérer les analytics HSE avancés
  async getHSEAnalytics(req, res) {
    try {
      const { period = 'monthly', type } = req.query;
      const startDate = this.getStartDate(period);

      const whereClause = {
        type: 'hse',
        date: {
          [Op.gte]: startDate
        }
      };

      if (type) {
        whereClause.metric = type;
      }

      const analytics = await Analytics.findAll({
        where: whereClause,
        order: [['date', 'DESC']]
      });

      // Calculer les tendances
      const trends = this.calculateTrends(analytics);
      
      // Calculer les ratios de conformité
      const complianceRatios = this.calculateComplianceRatios(analytics);

      res.json({
        success: true,
        data: {
          analytics,
          trends,
          complianceRatios,
          period
        }
      });
    } catch (error) {
      console.error('Erreur récupération analytics HSE:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des analytics HSE',
        error: error.message
      });
    }
  }

  // Créer une nouvelle métrique
  async createMetric(req, res) {
    try {
      const { type, metric, value, period, metadata, department } = req.body;
      
      const analytics = await Analytics.create({
        type,
        metric,
        value,
        period,
        date: new Date(),
        metadata,
        department,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        data: analytics,
        message: 'Métrique créée avec succès'
      });
    } catch (error) {
      console.error('Erreur création métrique:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la métrique',
        error: error.message
      });
    }
  }

  // Récupérer les métriques en temps réel
  async getRealTimeMetrics(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const metrics = await Analytics.findAll({
        where: {
          date: {
            [Op.gte]: today
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Erreur métriques temps réel:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des métriques temps réel',
        error: error.message
      });
    }
  }

  // Méthodes utilitaires
  getStartDate(period) {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart;
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  calculateKPIs(metrics) {
    const kpis = {};
    
    // KPIs HSE
    if (metrics.hse) {
      kpis.hse = {
        incidentsTotal: this.sumMetric(metrics.hse.incidents_total),
        incidentsResolved: this.sumMetric(metrics.hse.incidents_resolved),
        complianceRate: this.avgMetric(metrics.hse.compliance_rate),
        trainingCompletion: this.avgMetric(metrics.hse.training_completion)
      };
    }

    // KPIs Visites
    if (metrics.visits) {
      kpis.visits = {
        totalToday: this.sumMetric(metrics.visits.visits_today),
        averageDuration: this.avgMetric(metrics.visits.average_duration),
        completionRate: this.avgMetric(metrics.visits.completion_rate)
      };
    }

    // KPIs Colis
    if (metrics.packages) {
      kpis.packages = {
        totalReceived: this.sumMetric(metrics.packages.packages_received),
        deliveredOnTime: this.sumMetric(metrics.packages.delivered_ontime),
        deliveryRate: this.avgMetric(metrics.packages.delivery_rate)
      };
    }

    return kpis;
  }

  calculateTrends(analytics) {
    const trends = {};
    
    // Grouper par métrique
    const grouped = analytics.reduce((acc, item) => {
      if (!acc[item.metric]) {
        acc[item.metric] = [];
      }
      acc[item.metric].push(item);
      return acc;
    }, {});

    // Calculer les tendances pour chaque métrique
    Object.keys(grouped).forEach(metric => {
      const values = grouped[metric].map(item => parseFloat(item.value));
      if (values.length >= 2) {
        const latest = values[0];
        const previous = values[1];
        trends[metric] = {
          current: latest,
          previous: previous,
          change: latest - previous,
          changePercent: ((latest - previous) / previous) * 100
        };
      }
    });

    return trends;
  }

  calculateComplianceRatios(analytics) {
    const compliance = analytics.filter(item => 
      item.metric.includes('compliance') || item.metric.includes('conformity')
    );

    const total = compliance.length;
    const compliant = compliance.filter(item => parseFloat(item.value) >= 80).length;

    return {
      total,
      compliant,
      ratio: total > 0 ? (compliant / total) * 100 : 0
    };
  }

  sumMetric(metricArray) {
    if (!metricArray) return 0;
    return metricArray.reduce((sum, item) => sum + parseFloat(item.value), 0);
  }

  avgMetric(metricArray) {
    if (!metricArray || metricArray.length === 0) return 0;
    const sum = this.sumMetric(metricArray);
    return sum / metricArray.length;
  }
}

module.exports = new AnalyticsController();
