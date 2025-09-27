import type { LucideIcon } from 'lucide-react';
import { Settings, Shield, Users, Package, HardHat, Megaphone } from 'lucide-react';
import type { UserRole } from '@/types';

export type DemoAccountSlug = 'adm001' | 'hse001' | 'sup001' | 'rec001' | 'emp001' | 'com001';

export interface DemoAccount {
  id: string;
  slug: DemoAccountSlug;
  matricule: string;
  fullName: string;
  jobTitle: string;
  roles: UserRole[];
  featuredModule: string;
  description: string;
  responsibilities: string[];
  accessSummary: string;
  defaultRoute: string;
  loginHint?: string;
  colorClass: string;
  icon: LucideIcon;
}

export const demoAccounts: DemoAccount[] = [
  {
    id: '3',
    slug: 'adm001',
    matricule: 'ADM001',
    fullName: 'Mamadou DIALLO',
    jobTitle: 'Directeur Administratif',
    roles: ['ADMIN'],
    featuredModule: 'Tableau de bord global',
    description: 'Supervision complète du système SOGARA Access et administration des comptes.',
    responsibilities: [
      'Supervision générale des modules',
      'Gestion des utilisateurs et permissions',
      'Configuration et paramètres avancés',
      'Validation des processus critiques',
      'Analyse des rapports stratégiques',
      'Pilotage de la documentation technique'
    ],
    accessSummary: 'Accès complet à tous les modules',
    defaultRoute: '/app/dashboard',
    loginHint: 'Mot de passe démo : Admin123!',
    colorClass: 'bg-destructive text-destructive-foreground',
    icon: Settings,
  },
  {
    id: '4',
    slug: 'hse001',
    matricule: 'HSE001',
    fullName: 'Fatou NDIAYE',
    jobTitle: 'Responsable HSE',
    roles: ['HSE'],
    featuredModule: 'Sécurité et formations HSE',
    description: 'Pilotage des incidents, formations sécurité et conformité réglementaire.',
    responsibilities: [
      'Gestion des incidents de sécurité',
      'Organisation des formations HSE',
      'Suivi des habilitations et certifications',
      'Inspection des équipements de sécurité',
      'Validation des habilitations critiques',
      'Production des rapports sécurité'
    ],
    accessSummary: 'Accès : Personnel, Équipements, HSE',
    defaultRoute: '/app/hse',
    loginHint: 'Mot de passe démo : HSE123!',
    colorClass: 'bg-secondary text-secondary-foreground',
    icon: Shield,
  },
  {
    id: '5',
    slug: 'sup001',
    matricule: 'SUP001',
    fullName: 'Ousmane FALL',
    jobTitle: 'Chef d’Équipe Production',
    roles: ['SUPERVISEUR'],
    featuredModule: 'Suivi des équipes terrain',
    description: 'Coordination opérationnelle des équipes et suivi des visites critiques.',
    responsibilities: [
      'Supervision des équipes terrain',
      'Validation des visites prioritaires',
      'Suivi des équipements critiques',
      'Coordination inter-services',
      'Rapports d’activité quotidiens',
      'Gestion des urgences opérationnelles'
    ],
    accessSummary: 'Accès : Personnel, Visites, Équipements',
    defaultRoute: '/app/visites',
    loginHint: 'Mot de passe démo : Supervisor123!',
    colorClass: 'bg-primary text-primary-foreground',
    icon: Users,
  },
  {
    id: '2',
    slug: 'rec001',
    matricule: 'REC001',
    fullName: 'Aïssa TOURE',
    jobTitle: 'Réceptionniste Principal',
    roles: ['RECEP'],
    featuredModule: 'Gestion visiteurs et colis',
    description: 'Gestion de l’accueil physique, du contrôle badges et du courrier entrant.',
    responsibilities: [
      'Enregistrement des visiteurs',
      'Gestion des badges et check-in/out',
      'Réception des colis et courriers',
      'Distribution aux destinataires',
      'Gestion du registre d’entrées',
      'Premier contact sécuritaire'
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
    fullName: 'Ibrahima KANE',
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
      'Visualisation des équipements affectés'
    ],
    accessSummary: 'Accès : Dashboard, SOGARA Connect (lecture)',
    defaultRoute: '/app/dashboard',
    loginHint: 'Mot de passe démo : Employee123!',
    colorClass: 'bg-secondary text-secondary-foreground',
    icon: HardHat,
  },
  {
    id: '6',
    slug: 'com001',
    matricule: 'COM001',
    fullName: 'Aminata SECK',
    jobTitle: 'Chargée de Communication',
    roles: ['COMMUNICATION'],
    featuredModule: 'SOGARA Connect et contenus internes',
    description: 'Animation de la communication interne et gestion des publications officielles.',
    responsibilities: [
      'Création de contenu SOGARA Connect',
      'Publication des actualités internes',
      'Organisation des événements internes',
      'Gestion des annonces officielles',
      'Animation de la vie sociale',
      'Relations publiques internes'
    ],
    accessSummary: 'Accès : SOGARA Connect (édition complète)',
    defaultRoute: '/app/connect',
    loginHint: 'Mot de passe démo : Communication123!',
    colorClass: 'bg-accent text-accent-foreground',
    icon: Megaphone,
  },
];

export const getAccountBySlug = (slug: string) =>
  demoAccounts.find((account) => account.slug === slug.toLowerCase());

