import { Link } from 'react-router-dom';
import { kpis, siteCards } from '../data/siteData';

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

export default function Home() {
  return (
    <>
      {/* ── SEO title update ── */}
      <title>Nirikshan — Forecast Reliability Intelligence</title>

      {/* ── HERO ── */}
      <section
        className="section relative overflow-hidden"
        aria-labelledby="hero-wordmark"
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(36,36,232,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="page-container relative text-center">
          {/* Wordmark — LARGEST text on page */}
          <h1
            id="hero-wordmark"
            className="font-black tracking-tight leading-none mb-2"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 8rem)',
              color: 'var(--color-text)',
              letterSpacing: '-0.03em',
            }}
          >
            NIRIKSHAN
          </h1>

          {/* Tagline — second largest */}
          <p
            className="font-semibold tracking-wide mb-6"
            style={{
              fontSize: 'clamp(1.2rem, 3.5vw, 2rem)',
              color: 'var(--color-accent)',
            }}
          >
            Forecast Reliability Intelligence
          </p>

          {/* Descriptive headline — noticeably smaller */}
          <p
            className="font-normal max-w-2xl mx-auto mb-8"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--color-muted)',
              lineHeight: 1.7,
            }}
          >
            Know not just the forecast — know how much to trust it.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-10" aria-label="Project identifiers">
            <span className="badge">SIH26079</span>
            <span className="badge-warm">Ministry of Earth Sciences / NCMRWF</span>
            <span className="badge">SIH 2026</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mb-20">
            <Link to="/dashboard" className="btn-primary text-base px-7 py-3">
              Explore the Dashboard
              <ArrowRight />
            </Link>
            <Link to="/problem" className="btn-outline text-base px-7 py-3">
              Read the Problem Statement
            </Link>
          </div>

          {/* KPI strip */}
          <div
            className="rounded-2xl p-1"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="flex flex-col sm:flex-row items-stretch"
              role="list"
              aria-label="Key performance indicators — illustrative demo data"
            >
              {kpis.map((kpi, i) => (
                <div
                  key={kpi.label}
                  role="listitem"
                  className={`flex-1 flex flex-col items-center justify-center py-5 px-4 ${
                    i < kpis.length - 1 ? 'border-b sm:border-b-0 sm:border-r' : ''
                  }`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span
                    className="font-black text-3xl leading-none mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {kpi.value}
                  </span>
                  <span className="text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    {kpi.label}
                  </span>
                  <span className="demo-tag">{kpi.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SITE MAP GRID ── */}
      <section className="section" aria-labelledby="sitemap-heading">
        <div className="page-container">
          <div className="mb-10 text-center">
            <p className="section-label mb-2">Explore</p>
            <h2
              id="sitemap-heading"
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Everything Nirikshan offers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {siteCards.map(card => (
              <Link
                key={card.to}
                to={card.to}
                className="card group flex flex-col gap-3 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
                aria-label={`Go to ${card.title}`}
              >
                <span className="text-3xl" role="img" aria-hidden="true">{card.icon}</span>
                <h3
                  className="font-semibold text-base"
                  style={{ color: 'var(--color-text)' }}
                >
                  {card.title}
                </h3>
                <p className="text-sm flex-1" style={{ color: 'var(--color-muted)' }}>
                  {card.desc}
                </p>
                <span
                  className="flex items-center gap-1 text-xs font-semibold mt-1 transition-all duration-150 group-hover:gap-2"
                  style={{ color: 'var(--color-accent)' }}
                >
                  View <ArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
