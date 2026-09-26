import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <>
      <title>404 — Page Not Found | Nirikshan</title>

      <section
        className="section flex flex-col items-center justify-center text-center min-h-[60vh]"
        aria-labelledby="notfound-heading"
      >
        <div className="page-container max-w-lg">
          <p
            className="font-black text-8xl md:text-9xl leading-none mb-4"
            style={{ color: 'var(--color-accent)', opacity: 0.4 }}
            aria-hidden="true"
          >
            404
          </p>
          <h1
            id="notfound-heading"
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            Page not found
          </h1>
          <p className="text-base mb-10" style={{ color: 'var(--color-muted)' }}>
            This page doesn't exist — but the forecast confidence dashboard does.
          </p>
          <Link to="/" className="btn-primary text-base px-8 py-3">
            ← Back to Nirikshan home
          </Link>
        </div>
      </section>
    </>
  );
}
