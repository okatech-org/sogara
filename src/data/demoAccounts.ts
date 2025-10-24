import type { LucideIcon } from 'lucide-react'
import { Shield, Users, Package, HardHat, Megaphone, Crown, UserCog, FileCheck } from 'lucide-react'
import type { UserRole } from '@/types'

export type DemoAccountSlug =
  | 'hse001'
  | 'hse002'
  | 'rec001'
  | 'emp001'
  | 'com001'
  | 'dg001'
  | 'drh001'
  | 'ext001'
  | 'conf001'

export interface DemoAccount {
  id: string
  slug: DemoAccountSlug
  matricule: string
  fullName: string
  jobTitle: string
  roles: UserRole[]
  category: 'Direction' | 'HSSE' | 'Technicien'
  featuredModule: string
  description: string
  responsibilities: string[]
  accessSummary: string
  defaultRoute: string
  loginHint?: string
  colorClass: string
  icon: LucideIcon
}

export const demoAccounts: DemoAccount[] = [
  {
    id: '7',
    slug: 'dg001',
    matricule: 'DG001',
    fullName: 'Christian AVARO',
    jobTitle: 'Directeur Général',
    roles: ['DG', 'ADMIN'],
    category: 'Direction',
    featuredModule: 'Vision stratégique et pilotage',
    description:
      'Direction générale de SOGARA, pilotage stratégique et supervision de tous les départements.',
    responsibilities: [
      "Direction générale de l'entreprise",
      'Pilotage stratégique global',
      'Supervision de tous les départements',
      'Validation des décisions critiques',
      'Relations institutionnelles',
      'Pilotage de la performance globale',
      'Vision et orientation stratégique',
      'Prise de décisions stratégiques',
      "Représentation de l'entreprise",
    ],
    accessSummary: 'Accès complet à tous les modules et tableaux de bord stratégiques',
    defaultRoute: '/app/direction',
    loginHint: 'Mot de passe démo : DG123!',
    colorClass: 'bg-primary text-primary-foreground',
    icon: Crown,
  },
  {
    id: '8',
    slug: 'drh001',
    matricule: 'DRH001',
    fullName: 'Ingride TCHEN',
    jobTitle: 'Directrice des Ressources Humaines',
    roles: ['DRH', 'ADMIN'],
    category: 'Direction',
    featuredModule: 'Gestion des ressources humaines',
    description:
      'Direction des ressources humaines, gestion du personnel, formations et développement des compétences.',
    responsibilities: [
      'Direction des ressources humaines',
      'Gestion du personnel et des carrières',
      'Pilotage des formations et développement',
      'Gestion des compétences et habilitations',
      'Supervision du recrutement',
      'Relations sociales',
      'Gestion de la paie et administration du personnel',
      'Élaboration de la politique RH',
      'Suivi des indicateurs RH',
    ],
    accessSummary: 'Accès : Personnel, Formations, HSE, Tableaux de bord RH',
    defaultRoute: '/app/rh',
    loginHint: 'Mot de passe démo : DRH123!',
    colorClass: 'bg-secondary text-secondary-foreground',
    icon: UserCog,
  },
  {
    id: '6',
    slug: 'com001',
    matricule: 'COM001',
    fullName: 'Éric AVARO',
    jobTitle: 'Directeur Communication',
    roles: ['COMMUNICATION'],
    category: 'Direction',
    featuredModule: 'SOGARA Connect et contenus internes',
    description:
      'Direction de la communication, gestion complète de SOGARA Connect et animation de la communication interne.',
    responsibilities: [
      'Direction de la communication',
      'Gestion complète de SOGARA Connect',
      'Création de contenu SOGARA Connect',
      'Publication des actualités internes',
      'Organisation des événements internes',
      'Gestion des annonces officielles',
      'Animation de la vie sociale',
      'Relations publiques internes',
      'Stratégie de communication interne',
    ],
    accessSummary: 'Accès : SOGARA Connect (édition complète)',
    defaultRoute: '/app/connect',
    loginHint: 'Mot de passe démo : Communication123!',
    colorClass: 'bg-accent text-accent-foreground',
    icon: Megaphone,
  },
  {
    id: '4',
    slug: 'hse001',
    matricule: 'HSE001',
    fullName: 'Lié Orphé BOURDES',
    jobTitle: 'Chef de Division HSSE et Conformité',
    roles: ['HSSE_CHIEF', 'ADMIN', 'HSE', 'COMPLIANCE', 'SECURITE'],
    category: 'Direction',
    featuredModule: 'Sécurité, Conformité et HSSE',
    description:
      'Direction de la division HSSE, supervision de la conformité réglementaire et gestion de la sécurité incluant la réception.',
    responsibilities: [
      'Direction de la division HSSE et Conformité',
      'Administration et gestion des équipes HSSE et Sécurité',
      'Création et attribution de comptes Chef HSSE et Sécurité',
      'Attribution et gestion des rôles et habilitations',
      'Supervision globale des services HSSE',
      'Gestion des incidents de sécurité',
      'Supervision de la conformité réglementaire',
      'Organisation des formations HSSE',
      'Gestion de la sécurité et réception',
      'Suivi des habilitations et certifications',
      'Inspection des équipements de sécurité',
      'Validation des habilitations critiques',
      'Production des rapports sécurité et conformité',
      'Analyse des statistiques et tableaux de bord HSSE',
      'Coordination avec les responsables HSSE, Conformité et Sécurité',
    ],
    accessSummary: 'Accès : Personnel, Équipements, HSSE, Conformité, Sécurité, Réception',
    defaultRoute: '/app/hsse-management',
    loginHint: 'Mot de passe démo : HSE123!',
    colorClass: 'bg-secondary text-secondary-foreground',
    icon: Shield,
  },
  {
    id: '11',
    slug: 'hse002',
    matricule: 'HSE002',
    fullName: 'Lise Véronique DITSOUGOU',
    jobTitle: 'Chef HSSE Opérationnel',
    roles: ['HSE'],
    category: 'HSSE',
    featuredModule: 'Gestion HSE - Incidents et Formations',
    description:
      'Chef HSSE Opérationnel, gestion quotidienne des opérations HSSE, incidents et formations. Rapporte au Chef de Division HSSE.',
    responsibilities: [
      'Gestion quotidienne des opérations HSSE',
      'Gestion des incidents HSSE',
      'Organisation et suivi des formations HSSE',
      'Gestion des données HSE',
      'Production des rapports HSE',
      'Suivi des habilitations HSSE',
      'Inspection des équipements de sécurité HSE',
      'Validation des habilitations HSSE',
      'Coordination avec les équipes HSSE',
    ],
    accessSummary: 'Accès : Module HSE, Formations HSSE, Données HSE, Rapports HSE',
    defaultRoute: '/app/hse',
    loginHint: 'Mot de passe démo : HSE123!',
    colorClass: 'bg-green-600 text-white',
    icon: Shield,
  },
  {
    id: '2',
    slug: 'rec001',
    matricule: 'REC001',
    fullName: 'Sylvie KOUMBA',
    jobTitle: 'Responsable Sécurité',
    roles: ['SECURITE'],
    category: 'HSSE',
    featuredModule: 'Gestion Sécurité - Visites, Colis et Logistique',
    description:
      "Gestion de la sécurité, de l'accueil physique, du contrôle badges et du courrier entrant.",
    responsibilities: [
      'Gestion de la sécurité du site',
      'Enregistrement et gestion des visiteurs',
      'Gestion des badges et contrôle d\'accès',
      'Réception et gestion des colis et courriers',
      'Gestion du magasin d\'équipement',
      'Distribution et logistique des équipements',
      'Gestion du registre d\'entrées et sorties',
      'Premier contact sécuritaire',
      'Formation sécurité du personnel',
      'Production des rapports de sécurité',
    ],
    accessSummary: 'Accès : Module Sécurité, Visites/Colis/Courrier, Logistique, Formations Sécurité, Données Sécurité, Rapports Sécurité',
    defaultRoute: '/app/securite',
    loginHint: 'Mot de passe démo : Securite123!',
    colorClass: 'bg-blue-600 text-white',
    icon: Shield,
  },
  {
    id: '1',
    slug: 'emp001',
    matricule: 'EMP001',
    fullName: 'Pierre BEKALE',
    jobTitle: 'Technicien Raffinage',
    roles: ['EMPLOYE'],
    category: 'Technicien',
    featuredModule: 'Suivi individuel et formations',
    description: 'Consultation des informations personnelles et suivi des indicateurs individuels.',
    responsibilities: [
      'Consultation des informations de service',
      'Suivi des indicateurs personnels',
      'Lecture des actualités internes',
      'Participation aux événements',
      'Suivi des formations planifiées',
      'Visualisation des équipements affectés',
    ],
    accessSummary: 'Accès : Dashboard, SOGARA Connect (lecture)',
    defaultRoute: '/app/dashboard',
    loginHint: 'Mot de passe démo : Employee123!',
    colorClass: 'bg-secondary text-secondary-foreground',
    icon: HardHat,
  },
  {
    id: '10',
    slug: 'ext001',
    matricule: 'EXT001',
    fullName: 'Yoann ETENO',
    jobTitle: 'Technicien Maintenance - ONE.COM',
    roles: ['EXTERNE'],
    category: 'Technicien',
    featuredModule: "Passage de tests d'habilitation",
    description:
      "Candidat externe ONE.COM. Passage de tests d'habilitation pour accès zones de production.",
    responsibilities: [
      "Passage des tests d'habilitation requis",
      'Consultation des résultats et certificats',
      'Validation des procédures de sécurité',
      'Accès temporaire zones autorisées',
    ],
    accessSummary: "Accès : Tests d'habilitation, Résultats, Certificats",
    defaultRoute: '/app/formations-externes',
    loginHint: 'Mot de passe démo : External123!',
    colorClass: 'bg-orange-500 text-white',
    icon: Users,
  },
  {
    id: '12',
    slug: 'conf001',
    matricule: 'CONF001',
    fullName: 'Pierrette NOMSI',
    jobTitle: 'Responsable CONFORMITÉ',
    roles: ['COMPLIANCE'],
    category: 'HSSE',
    featuredModule: 'Gestion Conformité - Audits et Réglementation',
    description:
      'Responsable de la conformité réglementaire, des audits et du respect des normes HSSE chez SOGARA.',
    responsibilities: [
      'Supervision de la conformité réglementaire',
      'Coordination des audits internes et externes',
      'Suivi des certifications et accréditations',
      'Veille réglementaire et normative',
      'Gestion de la documentation de conformité',
      'Évaluation des risques de non-conformité',
      'Formation du personnel aux exigences réglementaires',
      'Production des rapports de conformité',
      'Interface avec les organismes de réglementation',
      'Mise en place des plans d\'action correctifs',
      'Suivi des indicateurs de conformité',
      'Gestion des non-conformités et des actions correctives',
    ],
    accessSummary: 'Accès : Module Conformité, Formations Conformité, Données Conformité, Rapports Conformité',
    defaultRoute: '/app/conformite',
    loginHint: 'Mot de passe démo : Conformite123!',
    colorClass: 'bg-purple-600 text-white',
    icon: FileCheck,
  },
]

export const getAccountBySlug = (slug: string) =>
  demoAccounts.find(account => account.slug === slug.toLowerCase())

export const getAccountsByCategory = () => {
  const categories = ['Direction', 'HSSE', 'Technicien'] as const
  return categories.map(category => ({
    category,
    accounts: demoAccounts.filter(account => account.category === category),
  }))
}
