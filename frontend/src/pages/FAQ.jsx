import { useState } from 'react';
import { faqs } from '../data/siteData';

function ChevronIcon({ open }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function AccordionItem({ q, a, isOpen, onToggle, id }) {
  const headingId = `faq-heading-${id}`;
  const panelId = `faq-panel-${id}`;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--color-surface)',
        borderColor: isOpen ? 'var(--color-accent)' : 'var(--color-border)',
      }}
    >
      <h3>
        <button
          id={headingId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
          style={{ color: 'var(--color-text)' }}
        >
          <span className="font-semibold text-sm md:text-base pr-2">{q}</span>
          <span
            className="flex-shrink-0"
            style={{ color: isOpen ? 'var(--color-accent)' : 'var(--color-muted)' }}
          >
            <ChevronIcon open={isOpen} />
          </span>
        </button>
      </h3>

      {/* Animated panel */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        style={{
          maxHeight: isOpen ? '500px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div
          className="px-6 pb-5 text-sm leading-relaxed border-t pt-4"
          style={{
            color: 'var(--color-muted)',
            borderColor: 'var(--color-border)',
          }}
        >
          {a}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = i => setOpenIndex(prev => (prev === i ? null : i));

  return (
    <>
      <title>FAQ — Nirikshan</title>

      {/* Page header */}
      <section
        className="py-16 md:py-24 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        aria-labelledby="faq-page-heading"
      >
        <div className="page-container max-w-3xl">
          <p className="section-label mb-3">Answers</p>
          <h1
            id="faq-page-heading"
            className="text-3xl md:text-5xl font-black leading-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
            Quick answers to the most common questions about Nirikshan.
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section className="section" aria-labelledby="faq-list-heading">
        <div className="page-container max-w-3xl">
          <h2 id="faq-list-heading" className="sr-only">FAQ list</h2>
          <div className="flex flex-col gap-3" role="list">
            {faqs.map((faq, i) => (
              <div key={i} role="listitem">
                <AccordionItem
                  id={i}
                  q={faq.q}
                  a={faq.a}
                  isOpen={openIndex === i}
                  onToggle={() => toggle(i)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
