import { useEffect, useState } from 'react';
import AuthModal from './components/auth/AuthModal';
import LoadingSpinner from './components/common/LoadingSpinner';
import AppLayout from './components/layout/AppLayout';
import { useAuth } from './contexts/AuthContext';
import AdminPanelPage from './pages/AdminPanelPage';
import BookingPage from './pages/BookingPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import HomePage from './pages/HomePage';

function App() {
  const { isAuthenticated, isInitializing, logout, refreshUser } = useAuth();
  const [view, setView] = useState('home');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authIntentLabel, setAuthIntentLabel] = useState('continue');
  const [pendingNavigation, setPendingNavigation] = useState(null);

  function handleBackHome() {
    setView('home');
    setSelectedDoctor(null);
  }

  function requestAuthenticatedNavigation(nextView, options = {}) {
    if (isAuthenticated) {
      if (options.doctor) {
        setSelectedDoctor(options.doctor);
      }
      setView(nextView);
      return;
    }

    setPendingNavigation({ nextView, doctor: options.doctor || null });
    setAuthIntentLabel(options.intentLabel || 'continue');
    setIsAuthModalOpen(true);
  }

  async function handleAuthenticated() {
    await refreshUser();

    if (pendingNavigation?.doctor) {
      setSelectedDoctor(pendingNavigation.doctor);
    }

    if (pendingNavigation?.nextView) {
      setView(pendingNavigation.nextView);
    }

    setPendingNavigation(null);
  }

  useEffect(() => {
    const protectedViews = new Set(['dashboard', 'admin', 'booking']);

    if (!isAuthenticated && protectedViews.has(view)) {
      handleBackHome();
    }
  }, [isAuthenticated, view]);

  if (isInitializing) {
    return (
      <AppLayout>
        <LoadingSpinner label="Restoring your session..." center />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {view === 'dashboard' ? (
        <DoctorDashboardPage onBackHome={handleBackHome} />
      ) : view === 'admin' ? (
        <AdminPanelPage onBackHome={handleBackHome} />
      ) : view === 'booking' && selectedDoctor ? (
        <BookingPage doctor={selectedDoctor} onBack={handleBackHome} />
      ) : (
        <HomePage
          onBookDoctor={(doctor) =>
            requestAuthenticatedNavigation('booking', {
              doctor,
              intentLabel: 'book an appointment',
            })
          }
          onOpenDashboard={() =>
            requestAuthenticatedNavigation('dashboard', {
              intentLabel: 'open the doctor dashboard',
            })
          }
          onOpenAdmin={() =>
            requestAuthenticatedNavigation('admin', {
              intentLabel: 'open the admin panel',
            })
          }
          onOpenLogin={() => {
            setPendingNavigation(null);
            setAuthIntentLabel('manage your appointments securely');
            setIsAuthModalOpen(true);
          }}
          onLogout={() => {
            logout();
            handleBackHome();
          }}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
        intentLabel={authIntentLabel}
      />
    </AppLayout>
  );
}

export default App;
