import { Link } from 'react-router-dom';
import { NirikshanMark } from './PremiumNavbar';

const LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Technology', to: '/how-it-works' },
  { label: 'Research', to: '/verification' },
  { label: 'Documentation', to: '/about' },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ice-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-5 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <NirikshanMark size={24} />
              <span className="text-[14px] font-extrabold tracking-[0.18em] text-navy-900">NIRIKSHAN</span>
            </div>
            <p className="mt-2.5 text-[13px] font-medium text-slate-500">Forecast Reliability Intelligence</p>
            <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-slate-400">
              Calibrated forecast-bust detection, regional confidence and model explainability for medium-range
              weather prediction.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-3">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-[13px] font-medium text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ice-100 pt-5 text-[11.5px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} Nirikshan · Forecast reliability intelligence
          </span>
          <span className="font-mono uppercase tracking-[0.14em]">Know when not to trust the forecast</span>
        </div>
      </div>
    </footer>
  );
}
