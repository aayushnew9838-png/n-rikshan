import { solutionPrinciples, goldenPath } from '../data/siteData';

export default function Solution() {
  return (
    <>
      <title>Solution — Nirikshan</title>

      {/* Page header */}
      <section
        className="py-16 md:py-24 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="solution-heading"
      >
        <div className="page-container max-w-3xl">
          <p className="section-label mb-3">Our approach</p>
          <h1
            id="solution-heading"
            className="text-3xl md:text-5xl font-black leading-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            The Nirikshan Solution
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
            Nirikshan turns hidden forecast uncertainty into an actionable, operator-facing
            confidence intelligence layer — built around five core interface principles and
            a single golden path through the data.
          </p>
        </div>
      </section>

      {/* Five principles */}
      <section className="section" aria-labelledby="principles-heading">
        <div className="page-container">
          {/* Callout quote */}
          <figure
            className="rounded-2xl p-8 mb-14 border-l-4 text-center md:text-left"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-accent)',
              border: `1px solid var(--color-border)`,
              borderLeftWidth: '4px',
              borderLeftColor: 'var(--color-accent)',
            }}
          >
            <blockquote
              className="text-xl md:text-2xl font-semibold italic mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              "Do not make the user hunt for confidence."
            </blockquote>
            <figcaption className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Nirikshan interface design mandate
            </figcaption>
          </figure>

          <div className="mb-10">
            <p className="section-label mb-2">Interface principles</p>
            <h2
              id="principles-heading"
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Five questions the interface must answer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutionPrinciples.map(p => (
              <article
                key={p.num}
                className="card flex flex-col gap-3"
                aria-label={`Principle ${p.num}: ${p.title}`}
              >
                <span
                  className="font-mono text-4xl font-black leading-none"
                  style={{ color: 'var(--color-accent)', opacity: 0.4 }}
                  aria-hidden="true"
                >
                  {p.num}
                </span>
                <h3
                  className="font-bold text-xl"
                  style={{ color: 'var(--color-text)' }}
                >
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {p.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Golden path */}
      <section
        className="section border-t"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="golden-path-heading"
      >
        <div className="page-container">
          <div className="mb-10">
            <p className="section-label mb-2">The golden path</p>
            <h2
              id="golden-path-heading"
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              How an operator moves through Nirikshan
            </h2>
            <figure
              className="inline-block rounded-xl px-5 py-3 border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <blockquote
                className="text-sm font-medium italic"
                style={{ color: 'var(--color-warm)' }}
              >
                "Show me where the forecast is least trustworthy and tell me why."
              </blockquote>
            </figure>
          </div>

          {/* Steps — vertical connector line */}
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-5 top-0 bottom-0 w-px hidden sm:block"
              style={{ background: 'var(--color-border)' }}
              aria-hidden="true"
            />

            <ol className="flex flex-col gap-6">
              {goldenPath.map((item, i) => (
                <li key={item.step} className="flex items-start gap-5">
                  {/* Step circle */}
                  <div
                    className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-accent)',
                      color: 'var(--color-accent)',
                    }}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <div
                    className="flex-1 rounded-xl p-5 border"
                    style={{
                      background: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <h3
                      className="font-bold text-base mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {item.step}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                      {item.desc}
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
