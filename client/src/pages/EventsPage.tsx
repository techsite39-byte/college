import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '../components/Layout';
import { apiRequest } from '../lib/api';

type EventItem = {
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  coverImage?: string;
};
type EventPage = { items: EventItem[]; page: number; total: number; pages: number };

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['events', page],
    queryFn: () => apiRequest<EventPage>(`public/events?page=${page}&limit=10`),
    retry: 1,
  });
  const events = data?.items ?? [];

  return (
    <PageLayout>
      <main className="section-shell min-h-[65vh] py-16 sm:py-20">
        <header className="mb-12 max-w-3xl"><p className="eyebrow">Events</p><h1 className="section-title">Learning and campus experiences.</h1><p className="mt-5 leading-7 text-slate-700">Published events and activities from the college.</p></header>
        {isLoading && <p role="status" className="py-10 text-slate-600">Loading events…</p>}
        {isError && <section role="alert" className="flex flex-col gap-4 border border-red-200 bg-red-50 p-5 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"><p>{error instanceof Error ? error.message : 'Events could not be loaded.'}</p><button type="button" onClick={() => void refetch()} disabled={isFetching} className="button-secondary"><RotateCcw size={16} aria-hidden="true" />{isFetching ? 'Retrying…' : 'Try again'}</button></section>}
        {!isLoading && !isError && !events.length && <p className="border border-navy/10 bg-white p-7 text-slate-700">There are no published events at this time. Please check back for updates.</p>}
        <div className="space-y-5">
          {events.map((event) => (
            <article key={event.slug} className="grid overflow-hidden border border-navy/10 bg-white md:grid-cols-[220px_1fr]">
              {event.coverImage && <img src={event.coverImage} alt="" width="600" height="420" loading="lazy" className="h-52 w-full object-cover md:h-full" />}
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <p className="eyebrow">{new Date(event.startDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                  <h2 className="text-display mt-2 text-2xl sm:text-3xl">{event.title}</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-slate-700">{event.description}</p>
                  {event.venue && <p className="mt-3 text-sm text-slate-600"><span className="font-semibold text-navy">Venue:</span> {event.venue}</p>}
                </div>
                <Link to={`/events/${event.slug}`} className="shrink-0 text-sm font-semibold underline decoration-gold decoration-2 underline-offset-4">Event details</Link>
              </div>
            </article>
          ))}
        </div>
        {data && data.pages > 1 && <nav aria-label="Event pages" className="mt-8 flex items-center justify-center gap-4 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-full border border-navy/15 bg-white px-4 py-2 disabled:opacity-40">Previous</button>
          <span>Page {data.page} of {data.pages}</span>
          <button type="button" disabled={page >= data.pages} onClick={() => setPage((value) => value + 1)} className="rounded-full border border-navy/15 bg-white px-4 py-2 disabled:opacity-40">Next</button>
        </nav>}
      </main>
    </PageLayout>
  );
}
