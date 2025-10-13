import type { LucideIcon } from 'lucide-react'
import { Settings, Shield, Users, Package, HardHat, Megaphone, Crown, UserCog } from 'lucide-react'
import type { UserRole } from '@/types'

export type DemoAccountSlug =
  | 'adm001'
  | 'hse001'
  | 'rec001'
  | 'emp001'
  | 'com001'
  | 'dg001'
  | 'drh001'
  | 'ext001'

export interface DemoAccount {
  id: string
  slug: DemoAccountSlug
  matricule: string
  fullName: string
  jobTitle: string
  roles: UserRole[]
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
    id: '3',
    slug: 'adm001',
    matricule: 'ADM001',
    fullName: 'PELLEN Asted',
    jobTitle: 'Administrateur Systèmes & Informatique',
    roles: ['ADMIN'],
    featuredModule: 'Administration système et supervision',
    description:
      'Administrateur ORGANEUS Gabon — Informatique et systèmes. Supervision, sécurité et configuration.',
    responsibilities: [
      'Supervision générale des modules',
      'Gestion des utilisateurs et permissions',
      'Configuration et paramètres avancés',
      'Validation des processus critiques',
      'Analyse des rapports stratégiques',
      'Pilotage de la documentation technique',
    ],
    accessSummary: 'Accès complet à tous les modules',
    defaultRoute: '/app/admin',
    loginHint: 'Mot de passe démo : Admin123!',
    colorClass: 'bg-destructive text-destructive-foreground',
    icon: Settings,
  },
  {
    id: '7',
    slug: 'dg001',
    matricule: 'DG001',
    fullName: 'Christian AVARO',
    jobTitle: 'Directeur Général',
    roles: ['DG', 'ADMIN'],
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
    fullName: 'Igride TCHEN',
    jobTitle: 'Directrice des Ressources Humaines',
    roles: ['DRH', 'ADMIN'],
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
    fullName: 'Lié Orphée BOURDES',
    jobTitle: 'Chef de Division HSE et Conformité',
    roles: ['HSE', 'COMPLIANCE', 'SECURITE'],
    featuredModule: 'Sécurité, Conformité et HSE',
    description:
      'Direction de la division HSE, supervision de la conformité réglementaire et gestion de la sécurité incluant la réception.',
    responsibilities: [
      'Direction de la division HSE et Conformité',
      'Gestion des incidents de sécurité',
      'Supervision de la conformité réglementaire',
      'Organisation des formations HSE',
      'Gestion de la sécurité et réception',
      'Suivi des habilitations et certifications',
      'Inspection des équipements de sécurité',
      'Validation des habilitations critiques',
      'Production des rapports sécurité et conformité',
      'Coordination avec les responsables HSE, Conformité et Sécurité',
    ],
    accessSummary: 'Accès : Personnel, Équipements, HSE, Conformité, Sécurité, Réception',
    defaultRoute: '/app/hse',
    loginHint: 'Mot de passe démo : HSE123!',
    colorClass: 'bg-secondary text-secondary-foreground',
    icon: Shield,
  },
  {
    id: '2',
    slug: 'rec001',
    matricule: 'REC001',
    fullName: 'Sylvie KOUMBA',
    jobTitle: 'Responsable Sécurité',
    roles: ['RECEP'],
    featuredModule: 'Gestion visiteurs et colis',
    description:
      "Gestion de la sécurité, de l'accueil physique, du contrôle badges et du courrier entrant.",
    responsibilities: [
      'Gestion de la sécurité du site',
      'Enregistrement des visiteurs',
      'Gestion des badges et check-in/out',
      'Réception des colis et courriers',
      'Distribution aux destinataires',
      "Gestion du registre d'entrées",
      'Premier contact sécuritaire',
    ],
    accessSummary: 'Accès : Visites, Colis & Courriers',
    defaultRoute: '/app/visites',
    loginHint: 'Mot de passe démo : Reception123!',
    colorClass: 'bg-accent text-accent-foreground',
    icon: Package,
  },
  {
    id: '1',
    slug: 'emp001',
    matricule: 'EMP001',
    fullName: 'Pierre BEKALE',
    jobTitle: 'Technicien Raffinage',
    roles: ['EMPLOYE'],
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
]

export const getAccountBySlug = (slug: string) =>
  demoAccounts.find(account => account.slug === slug.toLowerCase())
