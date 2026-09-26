import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { navLinks } from '../data/siteData';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function Header() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 px-1 py-0.5 rounded ${
      isActive
        ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
        : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
    }`;

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="Nirikshan home"
          >
            <span
              className="font-black text-xl tracking-tight"
              style={{ color: 'var(--color-accent)' }}
            >
              NIRIKSHAN
            </span>
            <span
              className="hidden sm:block text-xs font-medium tracking-wide"
              style={{ color: 'var(--color-warm)' }}
            >
              Forecast Reliability Intelligence
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg transition-colors duration-150"
              style={{
                color: 'var(--color-muted)',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-accent-muted)';
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-muted)';
              }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* CTA */}
            <Link to="/dashboard" className="btn-primary hidden sm:inline-flex">
              Live Dashboard
            </Link>

            {/* Hamburger (mobile/tablet) */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="lg:hidden p-2 rounded-lg transition-colors duration-150"
              style={{ color: 'var(--color-text)' }}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          className="lg:hidden border-t"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
          aria-label="Mobile navigation"
        >
          <div className="page-container py-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="btn-primary mt-3 justify-center"
            >
              Live Dashboard
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
