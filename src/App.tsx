import { useEffect } from 'react';
import { AppProvider, useAuth } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout/Layout';
import { WelcomePage } from '@/components/WelcomePage';

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <WelcomePage />;
  }

  return <Layout />;
}

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
