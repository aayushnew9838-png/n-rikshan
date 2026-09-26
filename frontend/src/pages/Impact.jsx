import { impactRoles, roadmapPhases } from '../data/siteData';

const statusConfig = {
  complete: { label: 'Complete', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  planned: { label: 'Planned', color: 'var(--color-muted)', bg: 'rgba(134,134,154,0.08)' },
};

export default function Impact() {
  return (
    <>
      <title>Impact & Roadmap — Nirikshan</title>

      {/* Page header */}
      <section
        className="py-16 md:py-24 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="impact-heading"
      >
        <div className="page-container max-w-3xl">
          <p className="section-label mb-3">Value delivered</p>
          <h1
            id="impact-heading"
            className="text-3xl md:text-5xl font-black leading-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Impact &amp; Roadmap
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
            Nirikshan delivers concrete value to three audiences and is built across a
            six-phase development roadmap tied to SIH milestones.
          </p>
        </div>
      </section>

      {/* Impact by audience */}
      <section className="section" aria-labelledby="audience-heading">
        <div className="page-container">
          <div className="mb-10">
            <p className="section-label mb-2">Who benefits</p>
            <h2
              id="audience-heading"
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Impact by audience
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impactRoles.map(r => (
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
                  {r.value}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section
        className="section border-t"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="roadmap-heading"
      >
        <div className="page-container">
          <div className="mb-10">
            <p className="section-label mb-2">Development plan</p>
            <h2
              id="roadmap-heading"
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Six-phase roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmapPhases.map(phase => {
              const cfg = statusConfig[phase.status];
              return (
                <article
                  key={phase.phase}
                  className="card flex flex-col gap-3"
                  aria-label={`Phase ${phase.phase}: ${phase.title}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-3xl font-black leading-none"
                      style={{ color: 'var(--color-accent)', opacity: 0.4 }}
                      aria-hidden="true"
                    >
                      {phase.phase}
                    </span>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-base"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {phase.title}
                  </h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-muted)' }}>
                    {phase.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
