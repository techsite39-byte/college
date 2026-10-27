import { Link } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import EnquiryForm from '../components/EnquiryForm';
import { courseNames } from '../data/siteContent';

export default function AdmissionsPage() {
  return (
    <PageLayout>
      <main className="section-shell py-16 sm:py-20">
        <header className="mb-12 max-w-4xl"><p className="eyebrow">Admissions</p><h1 className="section-title">Begin your journey in teacher education.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-700">Admission requirements and availability can change. Contact the college to confirm current information before applying.</p></header>
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="border border-navy/10 bg-white p-7 sm:p-8">
            <h2 className="text-display text-2xl">Programme information</h2>
            <p className="mt-4 leading-7 text-slate-700">The college lists teacher education programmes including:</p>
            <ul className="mt-5 space-y-3">{courseNames.map((course) => <li key={course.slug}><Link to={`/courses/${course.slug}`} className="font-semibold underline decoration-gold decoration-2 underline-offset-4">{course.title}</Link></li>)}</ul>
            <p className="mt-6 text-sm leading-6 text-slate-600">Course eligibility, approved intake, fees, deadlines and admission availability are not displayed until confirmed by the institution.</p>
            <div className="mt-6 flex flex-col gap-3 text-sm font-semibold">
              <Link to="/admissions/eligibility" className="underline decoration-gold decoration-2 underline-offset-4">Eligibility information</Link>
              <Link to="/admissions/how-to-apply" className="underline decoration-gold decoration-2 underline-offset-4">How to apply</Link>
            </div>
          </section>
          <section className="border border-navy/10 bg-white p-7 sm:p-8">
            <h2 className="text-display mb-2 text-2xl">Ask the admissions team</h2>
            <p className="mb-6 text-sm leading-6 text-slate-600">Share your contact details and question. Your enquiry is submitted securely to the college server.</p>
            <EnquiryForm />
          </section>
        </div>
      </main>
    </PageLayout>
  );
}
