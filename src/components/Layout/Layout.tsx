import { useState } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { Dashboard } from '@/pages/Dashboard';
import { PersonnelPage } from '@/pages/PersonnelPage';
import { VisitesPage } from '@/pages/VisitesPage';
import { ColisPage } from '@/pages/ColisPage';
import { EquipementsPage } from '@/pages/EquipementsPage';
import { HSEPage } from '@/pages/HSEPage';

export function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleCreateVisit = () => {
    setActiveTab('visites');
  };

  const handleCreatePackage = () => {
    setActiveTab('colis');
  };

  const handleCreateEquipment = () => {
    setActiveTab('equipements');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'personnel':
        return <PersonnelPage />;
      case 'visites':
        return <VisitesPage />;
      case 'colis':
        return <ColisPage />;
      case 'equipements':
        return <EquipementsPage />;
      case 'hse':
        return <HSEPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card">
      <Header 
        onCreateVisit={handleCreateVisit}
        onCreatePackage={handleCreatePackage}
        onCreateEquipment={handleCreateEquipment}
      />
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}