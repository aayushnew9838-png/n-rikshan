import { techStack, archLayers } from '../data/siteData';

export default function TechStack() {
  return (
    <>
      <title>Tech Stack & Architecture — Nirikshan</title>

      {/* Page header */}
      <section
        className="py-16 md:py-24 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="tech-heading"
      >
        <div className="page-container max-w-3xl">
          <p className="section-label mb-3">Engineering</p>
          <h1
            id="tech-heading"
            className="text-3xl md:text-5xl font-black leading-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Tech Stack &amp; Architecture
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
            Nirikshan's frontend is a modern React/Vite application with a strict
            REST/JSON API boundary — the browser never touches model code directly.
          </p>
        </div>
      </section>

      {/* Stack badges */}
      <section className="section" aria-labelledby="stack-heading">
        <div className="page-container">
          <div className="mb-10">
            <p className="section-label mb-2">Libraries & tools</p>
            <h2
              id="stack-heading"
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              The technology stack
            </h2>
          </div>

          {/* API boundary note */}
          <div
            className="rounded-xl px-6 py-4 mb-10 border-l-4 flex items-start gap-4"
            style={{
              background: 'var(--color-surface)',
              border: `1px solid var(--color-border)`,
              borderLeftWidth: '4px',
              borderLeftColor: 'var(--color-accent)',
            }}
            role="note"
          >
            <span className="text-2xl flex-shrink-0" aria-hidden="true">🔌</span>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                REST/JSON API boundary
              </p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                The frontend never touches model code directly. All forecast data is consumed via
                a versioned REST API returning JSON. This decoupling lets the ML backend evolve
                independently of the UI.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map(tech => (
              <article
                key={tech.name}
                className="card flex items-start gap-4"
                aria-label={tech.name}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{
                    background: 'var(--color-accent-muted)',
                    color: 'var(--color-accent)',
                  }}
                  aria-hidden="true"
                >
                  {tech.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3
                    className="font-semibold text-sm mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {tech.name}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {tech.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture layers */}
      <section
        className="section border-t"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="arch-heading"
      >
        <div className="page-container">
          <div className="mb-10">
            <p className="section-label mb-2">Architecture</p>
            <h2
              id="arch-heading"
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Application layers
            </h2>
          </div>

          <div className="max-w-2xl">
            <ol className="flex flex-col gap-4">
              {archLayers.map((layer, i) => (
                <li key={layer.num} className="flex items-stretch gap-5">
                  {/* Connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: 'var(--color-accent)',
                        color: '#ffffff',
                      }}
                      aria-hidden="true"
                    >
                      {layer.num}
                    </div>
                    {i < archLayers.length - 1 && (
                      <div
                        className="w-px flex-1 mt-2"
                        style={{ background: 'var(--color-border)' }}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div
                    className="flex-1 rounded-xl p-5 border mb-2"
                    style={{
                      background: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <h3
                      className="font-bold text-sm mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {layer.name}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                      {layer.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
