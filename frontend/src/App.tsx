import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import LeadTimePage from './pages/LeadTimePage';
import BustProbabilityPage from './pages/BustProbabilityPage';
import ErrorPronePage from './pages/ErrorPronePage';
import RegionsPage from './pages/RegionsPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import AnaloguesPage from './pages/AnaloguesPage';
import VerificationPage from './pages/VerificationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import AlertsPage from './pages/AlertsPage';
import SystemPage from './pages/SystemPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
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
