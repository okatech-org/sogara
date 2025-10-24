import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Home, 
  TrendingUp, 
  FileText, 
  Users, 
  PieChart, 
  Calendar, 
  BookOpen, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Wrench, 
  Package, 
  Megaphone, 
  Newspaper, 
  BarChart,
  ChevronDown,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  description: string;
  readOnly?: boolean;
}

interface MenuSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  expanded: boolean;
  items: MenuItem[];
}

const dgMenuSections: MenuSection[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 SECTION 1: PILOTAGE STRATÉGIQUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'pilotage',
    title: 'Pilotage Stratégique',
    icon: BarChart3,
    color: 'bg-blue-600',
    expanded: true, // Ouverte par défaut
    items: [
      {
        label: 'Tableau de Bord Direction',
        path: '/app/dg-strategic',
        icon: Home,
        description: 'Vue d\'ensemble consolidée + KPIs temps réel'
      },
      {
        label: 'Analytics & Prévisions',
        path: '/app/dg-analytics',
        icon: TrendingUp,
        description: 'Tendances 6 mois + Prédictions'
      },
      {
        label: 'Rapports Consolidés',
        path: '/app/dg-rapports',
        icon: FileText,
        description: 'Rapports PDF mensuels (auto-générés)'
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👥 SECTION 2: RESSOURCES HUMAINES (VISIBILITÉ)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'rh',
    title: 'Ressources Humaines',
    icon: Users,
    color: 'bg-green-600',
    expanded: false, // Fermée par défaut
    items: [
      {
        label: 'Vue Globale RH',
        path: '/app/dg-rh-overview',
        icon: PieChart,
        description: 'Effectif, répartition, turnover, formations'
      },
      {
        label: 'Personnel',
        path: '/app/personnel',
        icon: Users,
        description: 'Liste personnels (consultation)',
        readOnly: true
      },
      {
        label: 'Planning',
        path: '/app/planning',
        icon: Calendar,
        description: 'Vision planification globale',
        readOnly: true
      },
      {
        label: 'Formations & Habilitations',
        path: '/app/formations',
        icon: BookOpen,
        description: 'Taux conformité, programmes actifs',
        readOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛡️ SECTION 3: SÉCURITÉ & CONFORMITÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'hse',
    title: 'Sécurité & Conformité',
    icon: Shield,
    color: 'bg-red-600',
    expanded: false,
    items: [
      {
        label: 'Vision Stratégique HSE',
        path: '/app/dg-hse-overview',
        icon: Activity,
        description: 'KPIs sécurité, tendances, pilotage stratégique'
      },
      {
        label: 'Analyse des Incidents',
        path: '/app/hse-incidents-view',
        icon: AlertTriangle,
        description: 'Tableau de bord décisionnel incidents',
        readOnly: true
      },
      {
        label: 'Vision Conformité',
        path: '/app/dg-compliance-view',
        icon: CheckCircle,
        description: 'Tableau de bord décisionnel conformité',
        readOnly: true
      },
      {
        label: 'Formations HSE',
        path: '/app/hse',
        icon: BookOpen,
        description: 'Vue formations + taux compliance',
        readOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 SECTION 4: OPÉRATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'operations',
    title: 'Opérations',
    icon: Zap,
    color: 'bg-orange-600',
    expanded: false,
    items: [
      {
        label: 'Vue Opérationnelle',
        path: '/app/dg-operations-view',
        icon: Activity,
        description: 'Visites, colis, équipements (KPIs)'
      },
      {
        label: 'Visites & Visiteurs',
        path: '/app/visites',
        icon: Users,
        description: 'Flux visiteurs, statistiques',
        readOnly: true
      },
      {
        label: 'Colis & Courriers',
        path: '/app/colis',
        icon: Package,
        description: 'Traçabilité + volumes',
        readOnly: true
      },
      {
        label: 'Équipements',
        path: '/app/equipements',
        icon: Wrench,
        description: 'État opérationnel, maintenance',
        readOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📢 SECTION 5: COMMUNICATIONS INTERNES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'communications',
    title: 'Communications',
    icon: Megaphone,
    color: 'bg-purple-600',
    expanded: false,
    items: [
      {
        label: 'SOGARA Connect',
        path: '/app/connect',
        icon: Newspaper,
        description: 'Consultation articles + audience',
        readOnly: true
      },
      {
        label: 'Analytics Communications',
        path: '/app/connect-analytics',
        icon: BarChart,
        description: 'Engagement, audience, impact'
      }
    ]
  }
];

export function DirectorGeneralMenu() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['pilotage']) // Pilotage ouvert par défaut
  );

  const handleGenerateReport = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Rapport de direction générale généré avec succès');
    } catch (err) {
      alert('Erreur lors de la génération du rapport');
    }
  };

  const handleViewAnalytics = () => {
    alert('Ouverture des analytics de direction générale');
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-yellow-600" />
          <h2 className="font-bold text-base text-blue-700">👑 TABLEAU DE BORD DIRECTION</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Christian AVARO - DG001 | Directeur Général
        </p>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-600 text-white text-xs">Visibilité 360°</Badge>
          <Badge variant="outline" className="text-xs">Données décisionnelles</Badge>
        </div>
      </div>

      {/* Sections */}
      <div className="px-2 space-y-1">
        {dgMenuSections.map(section => (
          <div key={section.id}>
            {/* Header Section */}
            <button
              onClick={() => toggleSection(section.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                expandedSections.has(section.id) 
                  ? `${section.color} text-white shadow-md` 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700'
              )}
            >
              <section.icon className="w-4 h-4" />
              <span className="flex-1 text-left font-medium text-sm">
                {section.title}
              </span>
              <ChevronDown 
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  expandedSections.has(section.id) ? 'rotate-180' : ''
                )}
              />
            </button>

            {/* Items (affichés si expandé) */}
            {expandedSections.has(section.id) && (
              <div className="ml-2 mt-1 space-y-1 border-l-2 border-slate-200 pl-3 animate-in slide-in-from-top-2 duration-200">
                {section.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors',
                        isActive 
                          ? 'bg-slate-200 dark:bg-slate-800 font-semibold text-slate-900' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600'
                      )
                    }
                    title={item.description}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.readOnly && (
                      <Badge variant="outline" className="text-xs ml-auto bg-blue-50 text-blue-700 border-blue-200">
                        Lecture
                      </Badge>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer avec actions rapides */}
      <div className="p-4 border-t bg-slate-50">
        <p className="text-xs text-slate-500 mb-2">Actions rapides</p>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleGenerateReport}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            📊 Générer Rapport
          </button>
          <button 
            onClick={handleViewAnalytics}
            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
          >
            📈 Voir Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
