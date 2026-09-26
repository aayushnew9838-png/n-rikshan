import { problemRoles } from '../data/siteData';

export default function Problem() {
  return (
    <>
      <title>Problem Statement — Nirikshan</title>

      {/* Page header */}
      <section
        className="py-16 md:py-24 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="problem-heading"
      >
        <div className="page-container">
          <div className="max-w-3xl">
            <p className="section-label mb-3">SIH26079</p>
            <h1
              id="problem-heading"
              className="text-3xl md:text-5xl font-black leading-tight mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts
            </h1>
            <p className="text-base md:text-lg mb-6" style={{ color: 'var(--color-muted)' }}>
              Issuing Body:{' '}
              <span className="font-semibold" style={{ color: 'var(--color-warm)' }}>
                Ministry of Earth Sciences / NCMRWF
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="badge">Ministry of Earth Sciences</span>
              <span className="badge-warm">NCMRWF</span>
              <span className="badge">Smart India Hackathon 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="section" aria-labelledby="why-heading">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="section-label mb-3">Why it matters</p>
              <h2
                id="why-heading"
                className="text-2xl md:text-3xl font-bold mb-6"
                style={{ color: 'var(--color-text)' }}
              >
                Forecasts are only useful if users know when <em>not</em> to trust them
              </h2>
              <div
                className="space-y-4 text-sm md:text-base leading-relaxed"
                style={{ color: 'var(--color-muted)' }}
              >
                <p>
                  India's National Centre for Medium Range Weather Forecasting (NCMRWF) runs
                  complex numerical weather prediction (NWP) models daily, producing forecasts
                  up to 10 days ahead. These forecasts guide everything from agricultural
                  advisories to disaster preparedness.
                </p>
                <p>
                  Yet a fundamental limitation goes largely unaddressed: model skill{' '}
                  <strong style={{ color: 'var(--color-text)' }}>degrades predictably</strong>{' '}
                  over the Day 1–10 horizon, and this degradation is non-uniform — it varies
                  by region, season, and meteorological regime. A Day 5 forecast for the
                  Northeast in monsoon season may be far less reliable than one for
                  peninsular India in winter.
                </p>
                <p>
                  This uncertainty is rarely surfaced to the users who most need it. Forecast
                  busts — cases where the model is significantly wrong — are only identified
                  in retrospect. Operators act on predictions without knowing their
                  reliability, leading to misallocated resources and eroded trust in the
                  forecast system itself.
                </p>
                <p>
                  Nirikshan addresses this gap: surface bust probability{' '}
                  <strong style={{ color: 'var(--color-text)' }}>before</strong> the event,
                  spatially, across the Day 1–10 window — so decision-makers can calibrate
                  their confidence before acting.
                </p>
              </div>
            </div>

            {/* Stat callout */}
            <div
              className="rounded-2xl p-8 border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p className="section-label mb-6">The core gap</p>
              <ul className="flex flex-col gap-6">
                {[
                  {
                    icon: '📉',
                    heading: 'Degrading reliability over time',
                    body: 'Model skill drops from Day 1 to Day 10, but this curve is not shown alongside the forecast.',
                  },
                  {
                    icon: '🗺️',
                    heading: 'Spatial variability hidden',
                    body: 'A national-mean confidence number hides high-uncertainty regions that need special attention.',
                  },
                  {
                    icon: '⏰',
                    heading: 'Post-event identification only',
                    body: 'Forecast busts are currently diagnosed after the fact — too late to adjust resource deployment.',
                  },
                  {
                    icon: '👁️',
                    heading: 'No operator-facing reliability view',
                    body: 'Meteorologists and disaster operators lack a single interface that shows forecast trustworthiness.',
                  },
                ].map(item => (
                  <li key={item.heading} className="flex gap-4">
                    <span className="text-2xl flex-shrink-0 mt-0.5" role="img" aria-hidden="true">
                      {item.icon}
                    </span>
                    <div>
                      <h3
                        className="font-semibold text-sm mb-1"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {item.heading}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who it affects */}
      <section
        className="section border-t"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="roles-heading"
      >
        <div className="page-container">
          <div className="mb-10">
            <p className="section-label mb-2">Stakeholders</p>
            <h2
              id="roles-heading"
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Who does this affect?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problemRoles.map(r => (
              <article
                key={r.role}
                className="card"
                aria-label={r.role}
              >
                <span className="text-4xl mb-4 block" role="img" aria-hidden="true">
                  {r.icon}
                </span>
                <h3
                  className="font-bold text-lg mb-3"
                  style={{ color: 'var(--color-text)' }}
                >
                  {r.role}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {r.pain}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
