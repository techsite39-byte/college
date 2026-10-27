import { PageLayout } from '../components/Layout';
import { campusImages } from '../data/siteContent';

const facilities = [
  ['Learning spaces', 'Well-planned classrooms, assembly space and activity zones are described on the official college website.', campusImages.infrastructure],
  ['Academic resources', 'The official website lists library facilities and laboratories among the college facilities.', campusImages.facilities],
  ['Student wellbeing', 'Sports areas, a first-aid room and purified drinking water are listed as campus facilities.', campusImages.socialAwareness],
];

export default function CampusPage() {
  return (
    <PageLayout>
      <main className="section-shell py-16 sm:py-20">
        <header className="mb-12 max-w-3xl"><p className="eyebrow">Campus life</p><h1 className="section-title">Spaces and resources for learning.</h1><p className="mt-5 leading-7 text-slate-700">The facilities below are described on the official college website. Please contact the college to confirm current availability.</p></header>
        <div className="grid gap-6 md:grid-cols-3">
          {facilities.map(([title, description, image]) => (
            <article key={title} className="overflow-hidden border border-navy/10 bg-white">
              <img src={image} alt={title} width="760" height="520" loading="lazy" className="h-64 w-full object-cover" />
              <div className="p-6"><h2 className="text-display text-2xl">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-700">{description}</p></div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">Images are sourced from the official college website.</p>
      </main>
    </PageLayout>
  );
}
