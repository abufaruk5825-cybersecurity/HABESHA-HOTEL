import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// ── Public website ──────────────────────────────────────────────────────────
import { Navbar } from './components/common/Navbar';
import { PublicWebsite } from './pages/PublicWebsite';
import { BookingModal } from './components/website/BookingModal';
import { AuthModal } from './components/common/AuthModal';
import { AboutHeritageModal } from './components/website/AboutHeritageModal';
import { ContactLocationModal } from './components/website/ContactLocationModal';
import { FoodOrderProvider } from './context/FoodOrderContext';
import { FoodOrderModal } from './components/website/FoodOrderModal';

// ── Management dashboards ───────────────────────────────────────────────────
import { SuperAdminDashboard }   from './pages/superadmin/SuperAdminDashboard';
import { AdminDashboard }        from './pages/admin/AdminDashboard';
import { ManagerDashboard }      from './pages/manager/ManagerDashboard';
import { ReceptionDashboard }    from './pages/receptionist/ReceptionDashboard';
import { HousekeepingDashboard } from './pages/housekeeping/HousekeepingDashboard';
import { AccountantDashboard }   from './pages/accountant/AccountantDashboard';
import { CustomerDashboard }     from './pages/customer/CustomerDashboard';
import { MaintenanceDashboard }  from './pages/maintenance/MaintenanceDashboard';

// ── Utilities ───────────────────────────────────────────────────────────────
import { getDashboardViewForRole, isViewAuthorized, getRoleLabel } from './utils/roleUtils';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Read the role out of the JWT stored in localStorage (synchronous, no API call). */
function readRoleFromToken(): string | undefined {
  try {
    const token = localStorage.getItem('shms_token');
    if (!token) return undefined;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role as string | undefined;
  } catch {
    return undefined;
  }
}

const DASHBOARD_VIEWS = new Set([
  'superadmin', 'admin', 'manager', 'reception',
  'housekeeping', 'accountant', 'customer', 'maintenance',
]);

// ─────────────────────────────────────────────────────────────────────────────
// AppContent — rendered inside all providers
// ─────────────────────────────────────────────────────────────────────────────

function AppContent() {
  const { user, loading } = useAuth();
  const { theme, resetToLightMode } = useTheme();
  const [currentView, setCurrentView] = useState<string>('website');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | undefined>(undefined);
  const [bookingInitialCriteria, setBookingInitialCriteria] = useState<{
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    startStep?: 1 | 2;
  }>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  /** Check for initial hash (#about, #contact, #location) on page load */
  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#about') {
      setAboutModalOpen(true);
    } else if (hash === '#contact' || hash === '#location') {
      setContactModalOpen(true);
    }
  }, []);

  /** When a user is already logged-in on first load, jump straight to their dashboard in default Light Mode. */
  useEffect(() => {
    if (!loading && user && currentView === 'website') {
      const destination = getDashboardViewForRole(user.role);
      resetToLightMode();
      setCurrentView(destination);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleOpenBooking = (roomTypeId?: number) => {
    setSelectedRoomTypeId(roomTypeId);
    setBookingInitialCriteria({ startStep: 1 });
    setBookingModalOpen(true);
  };

  const handleSearchAvailability = (checkIn: string, checkOut: string, guests: number) => {
    setBookingInitialCriteria({
      checkIn,
      checkOut,
      guests,
      startStep: 2, // Dates chosen on Hero search, advance directly to Room Selection
    });
    setBookingModalOpen(true);
  };

  /** Called immediately after AuthContext.login() resolves — user state is now set. */
  const handleLoginSuccess = () => {
    // Open in Light Mode by default when signing in to dashboard
    resetToLightMode();
    // Give React one tick to propagate the new user state, then read from the token.
    setTimeout(() => {
      const destination = getDashboardViewForRole(readRoleFromToken());
      setCurrentView(destination);
    }, 0);
  };

  const handleNavigate = (view: string) => {
    if (DASHBOARD_VIEWS.has(view)) {
      resetToLightMode();
    }
    setCurrentView(view);
  };

  const goToWebsite = () => setCurrentView('website');

  // ── Decide which top-level view to render ──────────────────────────────────
  const isDashboard = DASHBOARD_VIEWS.has(currentView);

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/images/logo-hotel.png"
            alt="HABESHA-HOTEL"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/logo hotel.png';
            }}
            className="w-16 h-16 object-contain animate-pulse"
          />
          <p className="text-slate-400 text-sm">Loading HABESHA-HOTEL…</p>
        </div>
      </div>
    );
  }

  // ── Public website layout ──────────────────────────────────────────────────
  if (!isDashboard) {
    return (
      <FoodOrderProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
          <Navbar
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenBookingModal={handleOpenBooking}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onOpenAboutModal={() => setAboutModalOpen(true)}
            onOpenContactModal={() => setContactModalOpen(true)}
          />
          <main className="flex-1">
            <PublicWebsite
              onOpenBookingModal={handleOpenBooking}
              onSearchAvailability={handleSearchAvailability}
              onOpenAboutModal={() => setAboutModalOpen(true)}
              onOpenContactModal={() => setContactModalOpen(true)}
            />
          </main>

          <FoodOrderModal />

          {/* About Us & Heritage Dedicated Modal */}
          {aboutModalOpen && (
            <AboutHeritageModal
              isOpen={aboutModalOpen}
              onClose={() => setAboutModalOpen(false)}
              onOpenBooking={() => {
                setAboutModalOpen(false);
                handleOpenBooking();
              }}
              onOpenContact={() => {
                setAboutModalOpen(false);
                setContactModalOpen(true);
              }}
            />
          )}

          {/* Contact & Location Dedicated Modal */}
          {contactModalOpen && (
            <ContactLocationModal
              isOpen={contactModalOpen}
              onClose={() => setContactModalOpen(false)}
            />
          )}

          {bookingModalOpen && (
            <BookingModal
              isOpen={bookingModalOpen}
              onClose={() => {
                setBookingModalOpen(false);
                setSelectedRoomTypeId(undefined);
                setBookingInitialCriteria({});
              }}
              preselectedRoomTypeId={selectedRoomTypeId}
              initialCheckIn={bookingInitialCriteria.checkIn}
              initialCheckOut={bookingInitialCriteria.checkOut}
              initialGuests={bookingInitialCriteria.guests}
              initialStep={bookingInitialCriteria.startStep}
            />
          )}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={handleLoginSuccess}
          />
        </div>
      </FoodOrderProvider>
    );
  }

  // ── Management dashboard layout — NO public Navbar ─────────────────────────
  // Access gate: not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in with your authorized credentials to access the management portal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={goToWebsite}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Website
            </button>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // Access gate: wrong role
  if (!isViewAuthorized(currentView, user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your role (<strong className="text-amber-400 capitalize">{getRoleLabel(user.role)}</strong>) is not
              authorized for the <strong className="text-white uppercase">{currentView}</strong> portal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={goToWebsite}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Website
            </button>
            <button
              onClick={() => {
                resetToLightMode();
                setCurrentView(getDashboardViewForRole(user.role));
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              My {getRoleLabel(user.role)} Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Authorized dashboard — full screen, no public nav ─────────────────────
  const dashboardProps = { onNavigateToWebsite: goToWebsite };

  return (
    <div className={`dashboard-scope h-screen w-screen overflow-hidden font-sans ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}>
      {currentView === 'superadmin'  && <SuperAdminDashboard   {...dashboardProps} />}
      {currentView === 'admin'       && <AdminDashboard        {...dashboardProps} />}
      {currentView === 'manager'     && <ManagerDashboard      {...dashboardProps} />}
      {currentView === 'reception'   && <ReceptionDashboard    {...dashboardProps} />}
      {currentView === 'housekeeping'&& <HousekeepingDashboard {...dashboardProps} />}
      {currentView === 'accountant'  && <AccountantDashboard   {...dashboardProps} />}
      {currentView === 'customer'    && <CustomerDashboard     {...dashboardProps} />}
      {currentView === 'maintenance' && <MaintenanceDashboard  {...dashboardProps} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
