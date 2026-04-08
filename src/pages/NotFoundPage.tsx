import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFoundPage() {
  usePageMeta(
    'Page not found',
    'The page you requested could not be found. Return to the Nomos home page or browse the lawyer directory.',
  );

  return (
    <div className="min-h-[60vh] bg-slate-50 px-4 py-24">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          404
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          The page you asked for does not exist or the link is out of date.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Go home
          </Link>
          <Link
            to="/lawyers"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Browse lawyers
          </Link>
        </div>
      </div>
    </div>
  );
}
