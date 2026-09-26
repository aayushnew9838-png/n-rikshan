import { useState } from 'react';
import { contactInfo } from '../data/siteData';

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

const INITIAL = { name: '', email: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.message.trim()) e.message = 'Message is required.';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  };

  const inputClass = field => `
    w-full px-4 py-3 rounded-lg text-sm transition-all duration-150
    ${errors[field] ? 'border-red-500' : ''}
  `;

  const inputStyle = field => ({
    background: 'var(--color-bg)',
    border: `1.5px solid ${errors[field] ? '#ef4444' : 'var(--color-border-strong)'}`,
    color: 'var(--color-text)',
    outline: 'none',
  });

  return (
    <>
      <title>Contact — Nirikshan</title>

      {/* Page header */}
      <section
        className="py-16 md:py-24 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="contact-heading"
      >
        <div className="page-container max-w-3xl">
          <p className="section-label mb-3">Get in touch</p>
          <h1
            id="contact-heading"
            className="text-3xl md:text-5xl font-black leading-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Contact Us
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
            Questions, collaboration requests, or feedback — reach us below.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="contact-form-heading">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Form */}
            <div>
              <h2
                id="contact-form-heading"
                className="text-xl font-bold mb-6"
                style={{ color: 'var(--color-text)' }}
              >
                Send a message
              </h2>

              {submitted ? (
                /* Success state */
                <div
                  className="rounded-2xl p-10 border flex flex-col items-center text-center gap-4"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                  role="alert"
                  aria-live="polite"
                >
                  <span className="text-5xl" role="img" aria-label="Checkmark">✅</span>
                  <h3 className="font-bold text-xl" style={{ color: 'var(--color-text)' }}>
                    Message sent!
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Thanks, <strong style={{ color: 'var(--color-text)' }}>{form.name}</strong>. We'll
                    get back to you at <strong style={{ color: 'var(--color-text)' }}>{form.email}</strong>{' '}
                    as soon as possible.
                  </p>
                  <button
                    onClick={() => { setForm(INITIAL); setSubmitted(false); }}
                    className="btn-outline mt-2"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate aria-label="Contact form" className="flex flex-col gap-5">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Name <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={inputClass('name')}
                      style={inputStyle('name')}
                      onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; }}
                      onBlur={e => { if (!errors.name) e.target.style.borderColor = 'var(--color-border-strong)'; }}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-xs mt-1.5" style={{ color: '#ef4444' }} role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Email <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={inputClass('email')}
                      style={inputStyle('email')}
                      onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; }}
                      onBlur={e => { if (!errors.email) e.target.style.borderColor = 'var(--color-border-strong)'; }}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs mt-1.5" style={{ color: '#ef4444' }} role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Message <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what you're thinking…"
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className={`${inputClass('message')} resize-none`}
                      style={inputStyle('message')}
                      onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; }}
                      onBlur={e => { if (!errors.message) e.target.style.borderColor = 'var(--color-border-strong)'; }}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-xs mt-1.5" style={{ color: '#ef4444' }} role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn-primary self-start px-8 py-3 text-base">
                    Send message →
                  </button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-8">
              <div>
                <h2
                  className="text-xl font-bold mb-6"
                  style={{ color: 'var(--color-text)' }}
                >
                  Other ways to reach us
                </h2>
                <div className="flex flex-col gap-4">
                  {[
                    {
                      icon: <MailIcon />,
                      label: 'Team email',
                      value: contactInfo.email,
                      href: `mailto:${contactInfo.email}`,
                    },
                    {
                      icon: <GitHubIcon />,
                      label: 'GitHub repository',
                      value: 'nirikshan-sih',
                      href: contactInfo.github,
                    },
                    {
                      icon: <VideoIcon />,
                      label: 'Demo video',
                      value: 'Watch on YouTube',
                      href: contactInfo.demo,
                    },
                  ].map(item => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('mailto') ? undefined : '_blank'}
                      rel={item.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                      className="flex items-center gap-4 rounded-xl p-4 border transition-all duration-150 group no-underline"
                      style={{
                        background: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--color-accent)';
                        e.currentTarget.style.background = 'var(--color-accent-muted)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.background = 'var(--color-surface)';
                      }}
                    >
                      <span style={{ color: 'var(--color-accent)' }}>{item.icon}</span>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: 'var(--color-muted)' }}>
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          {item.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div
                className="rounded-xl p-5 border"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-warm)' }}>
                  SIH submission info
                </p>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Problem Statement ID: <strong style={{ color: 'var(--color-text)' }}>SIH26079</strong><br />
                  Organization: <strong style={{ color: 'var(--color-text)' }}>Ministry of Earth Sciences / NCMRWF</strong><br />
                  Event: <strong style={{ color: 'var(--color-text)' }}>Smart India Hackathon 2026</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
