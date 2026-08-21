import { useState, useEffect } from 'react';
import { User } from './types';
import { initStorage } from './utils/storage';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/DashboardLayout';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize mock database and admin user
    initStorage();
    
    // Check session
    const session = localStorage.getItem('phoenix_session');
    if (session) {
      setCurrentUser(JSON.parse(session));
    }
    
    setIsInitializing(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('phoenix_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('phoenix_session');
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center">Загрузка...</div>;
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <DashboardLayout user={currentUser} onLogout={handleLogout} />;
}
