import { Link } from 'react-router-dom';
import { navLinks } from '../data/siteData';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-auto"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-3" aria-label="Nirikshan home">
              <span
                className="font-black text-2xl tracking-tight"
                style={{ color: 'var(--color-accent)' }}
              >
                NIRIKSHAN
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
              AI-based forecast bust detection for medium-range weather forecasts.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="badge">SIH26079</span>
              <span className="badge-warm">NCMRWF</span>
            </div>
          </div>

          {/* Nav links */}
          <div className="md:col-span-1">
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-warm)' }}>
              Pages
            </h3>
            <nav aria-label="Footer navigation">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {navLinks.slice(1).map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors duration-150"
                      style={{ color: 'var(--color-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Info */}
          <div className="md:col-span-1">
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-warm)' }}>
              About
            </h3>
            <ul className="flex flex-col gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li>Ministry of Earth Sciences</li>
              <li>NCMRWF Problem SIH26079</li>
              <li>Smart India Hackathon 2026</li>
            </ul>
            <p className="text-xs mt-4" style={{ color: 'var(--color-muted)' }}>
              All statistics shown without a live source are{' '}
              <span className="demo-tag">illustrative data</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
        >
          <span>© {year} Team Nirikshan. Built for SIH 2026.</span>
          <span>React · Vite · Tailwind CSS · MapLibre GL JS</span>
        </div>
      </div>
    </footer>
  );
}
