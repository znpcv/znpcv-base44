import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import FreeChecklist from './pages/FreeChecklist';
import Landing from './pages/Landing';
import EconomicCalendarPage from './pages/EconomicCalendar';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

/**
 * Erkennt, ob die aktuelle Domain die öffentliche Hauptseite (znpcv.com)
 * oder der geschützte App-Bereich (znpcv.de / andere) ist.
 *
 * znpcv.com  → public landing world
 * znpcv.de   → protected app world (default für alle anderen Domains / localhost)
 */
const isPublicDomain = () => {
  const host = window.location.hostname;
  return host === 'znpcv.com' || host === 'www.znpcv.com';
};

/**
 * Öffentliche Route-Welt für znpcv.com
 * Nur Landing-Seite + statische Unterseiten — keine App-Routen, kein Login-Flow.
 */
const PublicRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/Landing" element={<Landing />} />
    {/* Alle anderen Pfade auf .com → zurück zur Landing */}
    <Route path="*" element={<Landing />} />
  </Routes>
);

/**
 * Geschützte App-Route-Welt für znpcv.de
 * Enthält alle Produkt-, Login- und Access-Routen.
 */
const AppRoutes = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/EconomicCalendar" element={
        <LayoutWrapper currentPageName="EconomicCalendar">
          <EconomicCalendarPage />
        </LayoutWrapper>
      } />
      <Route path="/FreeChecklist" element={
        <LayoutWrapper currentPageName="FreeChecklist">
          <FreeChecklist />
        </LayoutWrapper>
      } />
      <Route path="/Landing" element={
        <LayoutWrapper currentPageName="Landing">
          <Landing />
        </LayoutWrapper>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const AuthenticatedApp = () => {
  // znpcv.com → nur öffentliche Landing-Welt (kein Auth-Wrapper nötig)
  if (isPublicDomain()) return <PublicRoutes />;
  // znpcv.de und alle anderen → geschützte App-Welt
  return <AppRoutes />;
};


function App() {
  const isPublic = isPublicDomain();

  // znpcv.com — öffentliche Welt: kein Auth-Provider, kein Auth-Check
  if (isPublic) {
    return (
      <Router>
        <PublicRoutes />
      </Router>
    );
  }

  // znpcv.de — geschützte App-Welt: voller Auth- und Query-Stack
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App