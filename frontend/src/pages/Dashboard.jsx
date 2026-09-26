import { dashboardPanels, dashboardFeatures } from '../data/siteData';

function MockupFrame({ title, caption, index }) {
  const gradients = [
    'from-blue-900/40 to-indigo-900/40',
    'from-emerald-900/40 to-teal-900/40',
    'from-purple-900/40 to-violet-900/40',
    'from-amber-900/40 to-orange-900/40',
    'from-rose-900/40 to-pink-900/40',
  ];

  const icons = ['🖥️', '🗺️', '📈', '🔔', '📊'];

  return (
    <figure className="card overflow-hidden p-0 flex flex-col" aria-label={`${title} dashboard panel`}>
      {/* Mock screen */}
      <div
        className={`relative h-48 md:h-56 bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center`}
        aria-hidden="true"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {/* Fake UI chrome */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <div
            className="h-4 w-32 rounded-sm"
            style={{ background: 'var(--color-border)' }}
          />
        </div>

        {/* Fake content blocks */}
        <div className="flex flex-col items-center gap-3 px-8 w-full">
          <span className="text-4xl">{icons[index % icons.length]}</span>
          <div className="w-full flex flex-col gap-2">
            <div className="h-2 rounded-full w-3/4 mx-auto" style={{ background: 'var(--color-border-strong)' }} />
            <div className="h-2 rounded-full w-1/2 mx-auto" style={{ background: 'var(--color-border)' }} />
          </div>
          <div className="flex gap-2 w-full">
            {[0.7, 0.4, 0.85, 0.5, 0.65].map((h, j) => (
              <div
                key={j}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h * 40}px`,
                  background: `rgba(36,36,232,${0.3 + h * 0.4})`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Placeholder label */}
        <div
          className="absolute bottom-2 right-3 text-xs px-2 py-0.5 rounded"
          style={{
            background: 'rgba(0,0,0,0.5)',
            color: 'var(--color-warm)',
            backdropFilter: 'blur(4px)',
          }}
        >
          mockup
        </div>
      </div>

      {/* Caption */}
      <figcaption className="p-4 flex flex-col gap-1">
        <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          {title}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}

export default function Dashboard() {
  return (
    <>
      <title>Dashboard Preview — Nirikshan</title>

      {/* Page header */}
      <section
        className="py-16 md:py-24 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="dashboard-heading"
      >
        <div className="page-container max-w-3xl">
          <p className="section-label mb-3">Preview</p>
          <h1
            id="dashboard-heading"
            className="text-3xl md:text-5xl font-black leading-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Dashboard Preview
          </h1>
          <p className="text-lg mb-4" style={{ color: 'var(--color-muted)' }}>
            Mockup frames representing the five core screens of the Nirikshan operational
            dashboard. Real captures will replace these placeholders as development progresses.
          </p>
          <span className="demo-tag">All screens are illustrative mockups</span>
        </div>
      </section>

      {/* Mockup panels */}
      <section className="section" aria-labelledby="panels-heading">
        <div className="page-container">
          <p className="section-label mb-3">Screens</p>
          <h2
            id="panels-heading"
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ color: 'var(--color-text)' }}
          >
            Dashboard panels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardPanels.map((panel, i) => (
              <MockupFrame
                key={panel.title}
                title={panel.title}
                caption={panel.caption}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section
        className="section border-t"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="features-heading"
      >
        <div className="page-container">
          <div className="mb-10">
            <p className="section-label mb-2">Capabilities</p>
            <h2
              id="features-heading"
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Feature set
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardFeatures.map(feat => (
              <article
                key={feat.title}
                className="card"
                aria-label={feat.title}
              >
                <span className="text-3xl mb-4 block" role="img" aria-hidden="true">
                  {feat.icon}
                </span>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {feat.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
