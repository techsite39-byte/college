import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Paperclip, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '../components/Layout';
import { apiRequest } from '../lib/api';

type Notice = {
  title: string;
  slug: string;
  content: string;
  category?: string;
  attachment?: string;
  publishedAt?: string;
  isPinned?: boolean;
};
type NoticePage = { items: Notice[]; page: number; total: number; pages: number };

const noticeGridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const noticeCardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function LoadingSkeleton() {
  return (
    <div role="status" aria-label="Loading notices" className="grid gap-5 md:grid-cols-2">
      <span className="sr-only">Loading notices…</span>
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          aria-hidden="true"
          className="animate-pulse border border-navy/10 bg-white p-6 sm:p-7"
        >
          <div className="h-3 w-28 rounded bg-navy/10" />
          <div className="mt-5 h-7 w-4/5 rounded bg-navy/10" />
          <div className="mt-4 h-4 w-full rounded bg-navy/10" />
          <div className="mt-2 h-4 w-11/12 rounded bg-navy/10" />
          <div className="mt-2 h-4 w-3/5 rounded bg-navy/10" />
        </div>
      ))}
    </div>
  );
}

export default function NoticesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const reduceMotion = useReducedMotion();
  const shouldReduceMotion = reduceMotion === true;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['notices', page, search],
    queryFn: () => apiRequest<NoticePage>(`public/notices?page=${page}&limit=10&q=${encodeURIComponent(search.trim())}`),
    retry: 1,
  });
  const notices = data?.items ?? [];
  const showLoading = isLoading || isFetching;

  return (
    <PageLayout>
      <main>
        <section className="relative overflow-hidden border-b border-navy/10 bg-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
          <div className="section-shell relative py-16 sm:py-20 lg:py-24">
            <motion.header
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
              className="max-w-3xl"
            >
              <p className="eyebrow">Notice board</p>
              <h1 className="section-title max-w-3xl">Official updates and announcements.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
                Browse notices published by the college, or search for a specific update.
              </p>
            </motion.header>
          </div>
        </section>

        <section aria-label="College notices" className="section-shell min-h-[50vh] py-10 sm:py-14">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full max-w-2xl">
              <span className="sr-only">Search notices</span>
              <Search
                aria-hidden="true"
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search notices…"
                className="w-full rounded-xl border border-navy/15 bg-white py-3.5 pl-12 pr-12 text-navy shadow-sm outline-none transition placeholder:text-slate-500 hover:border-navy/30 focus:border-gold focus:ring-2 focus:ring-gold/25"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear notice search"
                  className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-ivory hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </label>
            {data && !showLoading && !isError && (
              <p className="text-sm text-slate-600" aria-live="polite">
                {data.total} {data.total === 1 ? 'notice' : 'notices'}
              </p>
            )}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {showLoading ? (
              <motion.div
                key="loading"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <LoadingSkeleton />
              </motion.div>
            ) : isError ? (
              <motion.section
                key="error"
                role="alert"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5 border border-red-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7"
              >
                <div>
                  <p className="text-sm font-semibold text-navy">Notices could not be loaded.</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {error instanceof Error ? error.message : 'Please try again in a moment.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1c2d47] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-60"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  {isFetching ? 'Retrying…' : 'Try again'}
                </button>
              </motion.section>
            ) : notices.length === 0 ? (
              <motion.section
                key="empty"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border border-navy/10 bg-white px-6 py-10 text-center sm:px-10 sm:py-14"
              >
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ivory text-navy">
                  <Search size={20} aria-hidden="true" />
                </div>
                <h2 className="text-display mt-5 text-2xl text-navy">
                  {search.trim() ? 'No notices match your search.' : 'No notices have been published yet.'}
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                  {search.trim()
                    ? 'Try a different search term to find a published update.'
                    : 'Please check back later for official college updates.'}
                </p>
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="mt-5 text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    Clear search
                  </button>
                )}
              </motion.section>
            ) : (
              <motion.div
                key={`notices-${search}-${page}`}
                variants={noticeGridVariants}
                initial={shouldReduceMotion ? false : 'hidden'}
                whileInView={shouldReduceMotion ? undefined : 'visible'}
                viewport={{ once: true, amount: 0.08 }}
                className="grid gap-5 md:grid-cols-2"
              >
                {notices.map((notice) => {
                  const publishedDate = notice.publishedAt ? new Date(notice.publishedAt) : null;

                  return (
                    <motion.article
                      key={notice.slug}
                      variants={shouldReduceMotion ? undefined : noticeCardVariants}
                      transition={{ duration: 0.24, ease: 'easeOut' }}
                      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                      className="group flex h-full flex-col border border-navy/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:border-navy/20 hover:shadow-card sm:p-7"
                    >
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        {notice.isPinned && (
                          <span className="rounded-full bg-gold/20 px-3 py-1 font-semibold text-navy">
                            Pinned
                          </span>
                        )}
                        {notice.category && (
                          <span className="rounded-full border border-navy/10 bg-ivory px-3 py-1 font-medium text-slate-700">
                            {notice.category}
                          </span>
                        )}
                        {publishedDate && !Number.isNaN(publishedDate.getTime()) && (
                          <time
                            dateTime={notice.publishedAt}
                            className="inline-flex items-center gap-1.5 text-slate-500"
                          >
                            <CalendarDays size={14} aria-hidden="true" />
                            {publishedDate.toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </time>
                        )}
                      </div>

                      <h2 className="text-display mt-4 text-2xl leading-snug text-navy transition-colors group-hover:text-slate-700">
                        {notice.title}
                      </h2>
                      <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{notice.content}</p>

                      <div className="mt-auto flex flex-wrap gap-x-6 gap-y-3 pt-6 text-sm font-semibold">
                        <Link
                          to={`/notices/${notice.slug}`}
                          className="underline decoration-gold decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                        >
                          Read full notice
                        </Link>
                        {notice.attachment && (
                          <a
                            href={notice.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-600 underline decoration-gold decoration-2 underline-offset-4 transition hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                          >
                            <Paperclip size={14} aria-hidden="true" />
                            Download attachment
                          </a>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {!showLoading && !isError && data && data.pages > 1 && (
            <nav aria-label="Notice pages" className="mt-9 flex flex-wrap items-center justify-center gap-4 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-full border border-navy/15 bg-white px-4 py-2.5 transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span aria-live="polite" className="text-slate-600">
                Page {data.page} of {data.pages}
              </span>
              <button
                type="button"
                disabled={page >= data.pages}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-full border border-navy/15 bg-white px-4 py-2.5 transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </main>
    </PageLayout>
  );
}
