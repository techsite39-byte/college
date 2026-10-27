import { Link } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import { campusImages } from '../data/siteContent';

export default function AboutPage() {
  return (
    <PageLayout>
      <main className="section-shell py-16 sm:py-20">
        <header className="mb-12 max-w-4xl"><p className="eyebrow">About the college</p><h1 className="section-title">A values-led approach to teacher education.</h1></header>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-5 text-base leading-8 text-slate-700">
            <p>Sri Aurobindo College of Education was established in 2016 under the aegis of the Sri Sai Mahathi Educational Society and received Government approval through G.O.Rt. No. 165, School Education Department, dated 16 September 2017.</p>
            <p>The same society established Sri Aurobindo College of Elementary Education in 2012, which received Government approval through G.O.Rt. No. 112, Education (PE-II) Department, dated 04 January 2013.</p>
            <p>The official institutional website states that both institutions are recognized by the National Council for Teacher Education (NCTE), Bengaluru, and are committed to quality teacher education, professional ethics and innovative teaching methodologies.</p>
            <p>The college describes its purpose as preparing competent, responsible and socially committed teachers who contribute meaningfully to educational progress.</p>
            <div className="flex flex-wrap gap-5 pt-3 text-sm font-semibold">
              <Link to="/about/history" className="underline decoration-gold decoration-2 underline-offset-4">Institutional history</Link>
              <Link to="/about/principal" className="underline decoration-gold decoration-2 underline-offset-4">Principal’s message</Link>
            </div>
          </div>
          <figure>
            <img src={campusImages.building} alt="Sri Aurobindo College of Education building" width="900" height="650" loading="lazy" className="h-[360px] w-full object-cover sm:h-[480px]" />
            <figcaption className="mt-3 text-xs text-slate-500">Image from the official college website.</figcaption>
          </figure>
        </div>
      </main>
    </PageLayout>
  );
}
