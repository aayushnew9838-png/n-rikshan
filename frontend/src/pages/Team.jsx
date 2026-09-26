import { teamMembers, teamName, teamInstitution } from '../data/siteData';

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function Team() {
  return (
    <>
      <title>Team — Nirikshan</title>

      {/* Page header */}
      <section
        className="py-16 md:py-24 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="team-heading"
      >
        <div className="page-container text-center max-w-2xl mx-auto">
          <p className="section-label mb-3">The builders</p>
          <h1
            id="team-heading"
            className="text-3xl md:text-5xl font-black leading-tight mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            {teamName}
          </h1>
          <p className="text-base" style={{ color: 'var(--color-muted)' }}>
            {teamInstitution}
          </p>
        </div>
      </section>

      {/* Team grid */}
      <section className="section" aria-labelledby="members-heading">
        <div className="page-container">
          <h2
            id="members-heading"
            className="sr-only"
          >
            Team members
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map(member => (
              <article
                key={member.name}
                className="card flex flex-col items-center text-center gap-4"
                aria-label={member.name}
              >
                {/* Avatar placeholder */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0"
                  style={{
                    background: 'var(--color-accent-muted)',
                    color: 'var(--color-accent)',
                    border: '2px solid var(--color-border-strong)',
                  }}
                  role="img"
                  aria-label={`${member.name} profile photo placeholder`}
                >
                  {member.initials}
                </div>

                <div>
                  <h3
                    className="font-bold text-lg mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {member.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-warm)' }}>
                    {member.role}
                  </p>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-4 mt-auto">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on GitHub`}
                    className="p-2 rounded-lg transition-colors duration-150"
                    style={{ color: 'var(--color-muted)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--color-text)';
                      e.currentTarget.style.background = 'var(--color-border)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--color-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <GitHubIcon />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                    className="p-2 rounded-lg transition-colors duration-150"
                    style={{ color: 'var(--color-muted)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#0a66c2';
                      e.currentTarget.style.background = 'rgba(10,102,194,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--color-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <LinkedInIcon />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
