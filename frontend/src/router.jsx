import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Problem from './pages/Problem';
import Solution from './pages/Solution';
import Dashboard from './pages/Dashboard';
import TechStack from './pages/TechStack';
import Impact from './pages/Impact';
import Team from './pages/Team';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'problem', element: <Problem /> },
      { path: 'solution', element: <Solution /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'tech-stack', element: <TechStack /> },
      { path: 'impact', element: <Impact /> },
      { path: 'team', element: <Team /> },
      { path: 'faq', element: <FAQ /> },
      { path: 'contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
