import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import AppErrorBoundary from './components/AppErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

const HomePage = lazy(() => import('./pages/HomePage'));
const IntakePage = lazy(() => import('./pages/IntakePage'));
const LawyersPage = lazy(() => import('./pages/LawyersPage'));
const LawyerProfilePage = lazy(() => import('./pages/LawyerProfilePage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ClientPortalPage = lazy(() => import('./pages/ClientPortalPage'));
const ForLawyersPage = lazy(() => import('./pages/ForLawyersPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function AppShell() {
  const location = useLocation();
  const showMarketingChrome = !location.pathname.startsWith('/portal');

  return (
    <>
      <ScrollToTop />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="min-h-screen bg-white text-slate-900">
        {showMarketingChrome ? <Header /> : null}
        <main id="main-content">
          <Suspense fallback={<RouteLoadingScreen />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/intake" element={<IntakePage />} />
              <Route path="/lawyers" element={<LawyersPage />} />
              <Route path="/lawyer/:id" element={<LawyerProfilePage />} />
              <Route path="/booking/:id" element={<BookingPage />} />
              <Route path="/portal" element={<ClientPortalPage />} />
              <Route path="/for-lawyers" element={<ForLawyersPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        {showMarketingChrome ? <Footer /> : null}
      </div>
    </>
  );
}

function RouteLoadingScreen() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-r-transparent" />
        <p className="mt-4 text-sm text-slate-600">Loading page...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
