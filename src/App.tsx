import { useEffect } from 'react';
import { AppProvider, useAuth } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout/Layout';
import { LoginForm } from '@/components/auth/LoginForm';

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <LoginForm />;
  }

  return <Layout />;
}

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
