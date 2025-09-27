import { useState } from 'react';
import { AppProvider, useAuth } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout/Layout';
import { WelcomePage } from '@/components/WelcomePage';
import { LoginForm } from '@/components/auth/LoginForm';

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (isAuthenticated && currentUser) {
    return <Layout />;
  }

  if (showLogin) {
    return <LoginForm onBackToHome={() => setShowLogin(false)} />;
  }

  return <WelcomePage onShowLogin={() => setShowLogin(true)} />;
}

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
