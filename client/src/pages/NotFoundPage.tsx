import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="rounded-[2rem] border border-navy/10 bg-white p-8 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">404</p>
        <h1 className="text-display mt-4 text-5xl text-navy">Page not found</h1>
        <p className="mt-4 text-slate-600">The page you are looking for may have moved or no longer exists.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">Return home</Link>
      </div>
    </main>
  );
}
