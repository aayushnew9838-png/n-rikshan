import { Link, NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';
import {
  NirikshanMark,
  IconDashboard,
  IconMap,
  IconGrid,
  IconTarget,
  IconBulb,
  IconHistory,
  IconCompare,
  IconBell,
  IconChart,
  IconFile,
  IconCpu,
  IconInfo,
  IconBook,
  IconActivity,
  IconGlobe,
  IconWaves,
} from '../components/ui/icons';

interface NavItem {
  to: string;
  label: string;
  icon: (p: { width?: number; height?: number }) => JSX.Element;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Operations',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
      { to: '/map', label: 'Confidence Map', icon: IconMap },
      { to: '/lead-time', label: 'Day 1-10 Reliability', icon: IconGrid },
      { to: '/bust-probability', label: 'Bust Probability', icon: IconTarget },
      { to: '/error-prone', label: 'Error-Prone Areas', icon: IconActivity },
      { to: '/regions', label: 'Regional Intelligence', icon: IconGlobe },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { to: '/explainability', label: 'Why Confidence Is Low', icon: IconBulb },
      { to: '/analogues', label: 'Historical Analogues', icon: IconHistory },
      { to: '/verification', label: 'Forecast vs Verification', icon: IconCompare },
      { to: '/analytics', label: 'Analytics', icon: IconChart },
      { to: '/case-studies', label: 'Case Studies', icon: IconFile },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/alerts', label: 'Alerts & Watchlist', icon: IconBell },
      { to: '/system', label: 'Model & System', icon: IconCpu },
      { to: '/about', label: 'About Nirikshan', icon: IconInfo },
    ],
  },
];

export function Sidebar({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        'flex h-full flex-col border-r border-ice-200 bg-white transition-[width] duration-300 ease-smooth',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <Link
        to="/"
        title="Back to the Nirikshan landing page"
        aria-label="Nirikshan home - back to the landing page"
        className={cn(
          'flex h-[60px] shrink-0 items-center gap-2.5 border-b border-ice-200 px-4 transition-colors hover:bg-ice-50',
          collapsed && 'justify-center px-0',
        )}
      >
        <NirikshanMark size={28} />
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-[15px] font-extrabold leading-none tracking-[0.14em] text-navy-900">
              NIRIKSHAN
            </div>
            <div className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
              Forecast reliability
            </div>
          </div>
        )}
      </Link>

      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        <NavLink
          to="/"
          end
          onClick={onNavigate}
          title="Product introduction"
          className={({ isActive }) =>
            cn(
              'mb-4 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors',
              isActive ? 'bg-ice-100 text-blue-700' : 'text-slate-600 hover:bg-ice-50 hover:text-navy-900',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <IconBook width={17} height={17} />
          {!collapsed && <span>Product Intro</span>}
        </NavLink>

        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            {!collapsed && <div className="eyebrow mb-2 px-3">{group.title}</div>}
            {collapsed && <div className="mx-3 mb-2 border-t border-ice-200" />}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onNavigate}
                      title={item.label}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
                          isActive
                            ? 'bg-blue-600 text-white shadow-soft'
                            : 'text-slate-600 hover:bg-ice-50 hover:text-navy-900',
                          collapsed && 'justify-center px-0',
                        )
                      }
                    >
                      <Icon width={17} height={17} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <NavLink
          to="/how-it-works"
          onClick={onNavigate}
          title="How It Works"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors',
              isActive ? 'bg-ice-100 text-blue-700' : 'text-slate-600 hover:bg-ice-50 hover:text-navy-900',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <IconWaves width={17} height={17} />
          {!collapsed && <span>How It Works</span>}
        </NavLink>
      </div>

      <div className="border-t border-ice-200 p-3">
        {!collapsed ? (
          <div className="rounded-lg bg-ice-50 p-3">
            <div className="eyebrow mb-1">Forecast reliability</div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Calibrated bust detection, regional confidence and model explainability for medium-range
              forecasts.
            </p>
          </div>
        ) : (
          <div className="mx-auto h-8 w-8 rounded-md bg-ice-100" />
        )}
      </div>
    </nav>
  );
}

const CRUMBS: Record<string, string> = {
  '/dashboard': 'Operations Dashboard',
  '/map': 'Forecast Confidence Map',
  '/lead-time': 'Day 1-10 Reliability',
  '/bust-probability': 'Forecast Bust Probability',
  '/error-prone': 'Error-Prone Areas',
  '/regions': 'Regional Intelligence',
  '/explainability': 'Explainability',
  '/analogues': 'Historical Analogues',
  '/verification': 'Forecast vs Verification',
  '/analytics': 'Analytics',
  '/case-studies': 'Case Studies',
  '/alerts': 'Alerts & Watchlist',
  '/system': 'Model & System',
  '/about': 'About Nirikshan',
  '/how-it-works': 'How It Works',
  '/': 'Product Introduction',
};

export function locationToCrumbs(pathname: string): string[] {
  const label = CRUMBS[pathname];
  return label ? [label] : [];
}
