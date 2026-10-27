import { useQuery } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import { apiRequest } from '../lib/api';

type ContentItem = {
  title: string;
  slug: string;
  description?: string;
  fullDescription?: string;
  content?: string;
  startDate?: string;
  publishedAt?: string;
  venue?: string;
  image?: string;
  coverImage?: string;
  attachment?: string;
  documents?: string[];
};

export default function ContentDetailPage({ kind }: { kind: 'courses' | 'events' | 'notices' }) {
  const { slug = '' } = useParams();
  const collection = kind === 'courses' ? 'courses' : kind;
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [collection, slug],
    queryFn: () => apiRequest<ContentItem>(`public/${collection}/${encodeURIComponent(slug)}`),
    retry: 1,
  });

  return (
    <PageLayout>
      <main className="section-shell min-h-[65vh] py-16 sm:py-20">
        <p className="eyebrow"><Link to={`/${collection}`} className="hover:text-navy">{collection}</Link></p>
        {isLoading && <p role="status" className="py-10 text-slate-600">Loading…</p>}
        {isError && <div role="alert" className="mt-6 border border-navy/10 bg-white p-7"><h1 className="text-display text-3xl">This item is unavailable.</h1><p className="mt-3 text-slate-700">{error instanceof Error ? error.message : 'The published content could not be loaded.'}</p><div className="mt-5 flex flex-wrap items-center gap-5"><button type="button" onClick={() => void refetch()} disabled={isFetching} className="button-secondary"><RotateCcw size={16} aria-hidden="true" />{isFetching ? 'Retrying…' : 'Try again'}</button><Link to={`/${collection}`} className="font-semibold underline decoration-gold decoration-2 underline-offset-4">Back to {collection}</Link></div></div>}
        {data && (
          <article className="mt-5 max-w-4xl">
            <h1 className="section-title">{data.title}</h1>
            {(data.startDate || data.publishedAt) && <p className="mt-4 text-sm text-slate-500">{new Date(data.startDate || data.publishedAt || '').toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>}
            {(data.image || data.coverImage) && <img src={data.image || data.coverImage} alt="" width="1200" height="700" className="mt-8 max-h-[520px] w-full object-cover" />}
            {data.venue && <p className="mt-5 text-sm text-slate-600"><span className="font-semibold text-navy">Venue:</span> {data.venue}</p>}
            <div className="mt-7 whitespace-pre-line text-base leading-8 text-slate-700">{data.fullDescription || data.content || data.description}</div>
            {data.attachment && <a href={data.attachment} target="_blank" rel="noreferrer" className="mt-6 inline-block font-semibold underline decoration-gold decoration-2 underline-offset-4">Download attachment</a>}
            {data.documents?.map((document, index) => <a key={document} href={document} target="_blank" rel="noreferrer" className="mt-4 mr-5 inline-block font-semibold underline decoration-gold decoration-2 underline-offset-4">Course document {index + 1}</a>)}
          </article>
        )}
      </main>
    </PageLayout>
  );
}
