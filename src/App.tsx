import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/store';
import Landing from '@/pages/Landing';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import StudentDashboard from '@/pages/StudentDashboard';
import WardenDashboard from '@/pages/WardenDashboard';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';

type View = 'landing' | 'register' | 'login';

function AppInner() {
  const app = useApp();
  const [view, setView] = useState<View>('landing');

  if (app.user) {
    if (app.user.role === 'student') {
      return <StudentDashboard onLogout={app.logout} onHome={() => { app.logout(); setView('landing'); }} />;
    }
    if (app.user.role === 'warden') {
      return <WardenDashboard onLogout={app.logout} onHome={() => { app.logout(); setView('landing'); }} />;
    }
    return <MaintenanceDashboard onLogout={app.logout} onHome={() => { app.logout(); setView('landing'); }} />;
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' && (
        <Landing
          key="landing"
          onRegister={() => setView('register')}
          onLogin={() => setView('login')}
          onExplore={() => setView('login')}
        />
      )}
      {view === 'register' && (
        <Register key="register" onBack={() => setView('landing')} onLogin={() => setView('login')} />
      )}
      {view === 'login' && (
        <Login key="login" onBack={() => setView('landing')} onRegister={() => setView('register')} />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
