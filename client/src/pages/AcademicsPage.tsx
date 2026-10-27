import { Link } from 'react-router-dom';
import { PageLayout } from '../components/Layout';

export default function AcademicsPage() {
  return (
    <PageLayout>
      <main className="section-shell min-h-[65vh] py-16 sm:py-20">
        <header className="mb-12 max-w-4xl">
          <p className="eyebrow">Academics</p>
          <h1 className="section-title">Teacher education grounded in professional values.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            The college states its commitment to quality teacher education, high academic standards, professional ethics and innovative teaching methodologies. Detailed syllabi and academic schedules are published only when confirmed by the institution.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-2">
          <article className="border border-navy/10 bg-white p-7 sm:p-8">
            <p className="eyebrow">Institutional commitment</p>
            <h2 className="text-display mt-3 text-2xl">Quality teacher education</h2>
            <p className="mt-4 leading-7 text-slate-700">Sri Aurobindo College of Education describes its work as preparing competent, responsible and socially committed teachers.</p>
          </article>
          <article className="border border-navy/10 bg-white p-7 sm:p-8">
            <p className="eyebrow">Recognition</p>
            <h2 className="text-display mt-3 text-2xl">NCTE recognition</h2>
            <p className="mt-4 leading-7 text-slate-700">The official institutional website states that the college is recognized by the National Council for Teacher Education (NCTE), Bengaluru.</p>
          </article>
        </div>
        <div className="mt-8 border-l-2 border-gold bg-white p-6">
          <h2 className="text-display text-2xl">Academic programme information</h2>
          <p className="mt-3 leading-7 text-slate-700">Programme details, syllabi and schedules will appear here when verified and published.</p>
          <Link to="/courses" className="mt-5 inline-flex font-semibold underline decoration-gold decoration-2 underline-offset-4">View published courses</Link>
        </div>
      </main>
    </PageLayout>
  );
}
