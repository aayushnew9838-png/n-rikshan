import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { PageSkeleton } from './components/ui/states';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';

const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MapPage = lazy(() => import('./pages/MapPage'));
const LeadTimePage = lazy(() => import('./pages/LeadTimePage'));
const BustProbabilityPage = lazy(() => import('./pages/BustProbabilityPage'));
const ErrorPronePage = lazy(() => import('./pages/ErrorPronePage'));
const RegionsPage = lazy(() => import('./pages/RegionsPage'));
const ExplainabilityPage = lazy(() => import('./pages/ExplainabilityPage'));
const AnaloguesPage = lazy(() => import('./pages/AnaloguesPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const CaseStudiesPage = lazy(() => import('./pages/CaseStudiesPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const SystemPage = lazy(() => import('./pages/SystemPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/how-it-works"
          element={
            <Suspense fallback={<div className="mx-auto max-w-[1400px] px-5 py-16"><PageSkeleton /></div>}>
              <HowItWorksPage />
            </Suspense>
          }
        />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/lead-time" element={<LeadTimePage />} />
          <Route path="/bust-probability" element={<BustProbabilityPage />} />
          <Route path="/error-prone" element={<ErrorPronePage />} />
          <Route path="/regions" element={<RegionsPage />} />
          <Route path="/explainability" element={<ExplainabilityPage />} />
          <Route path="/analogues" element={<AnaloguesPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/case-studies" element={<CaseStudiesPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/system" element={<SystemPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
