import { Link } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import { campusImages } from '../data/siteContent';

const content: Record<string, { title: string; paragraphs: string[]; image?: string }> = {
  history: {
    title: 'The institution’s history',
    paragraphs: [
      'Sri Aurobindo College of Elementary Education was established under the aegis of the Sri Sai Mahathi Educational Society in 2012 and received Government approval through G.O.Rt. No. 112, Education (PE-II) Department, dated 04 January 2013.',
      'Sri Aurobindo College of Education was subsequently established in 2016 and received Government approval through G.O.Rt. No. 165, School Education Department, dated 16 September 2017.',
      'The official website identifies both institutions as recognized by the National Council for Teacher Education (NCTE), Bengaluru.',
    ],
    image: campusImages.building,
  },
  principal: {
    title: 'A message from the principal',
    paragraphs: [
      '“We help every student become responsible, capable and kind.”',
      'The college’s official website describes its mission as nurturing responsible learners who combine academic excellence with empathy, resilience and social awareness. A principal’s name and longer approved message were not available in the source material and are intentionally not attributed here.',
    ],
    image: campusImages.principalMessage,
  },
  eligibility: {
    title: 'Admission eligibility',
    paragraphs: [
      'Eligibility requirements are programme-specific and may change. The college has not published verified current eligibility details in the information available to this website.',
      'Please contact admissions directly before preparing an application. The college can confirm qualifications, required documents and applicable regulations for your chosen programme.',
    ],
  },
  apply: {
    title: 'How to apply',
    paragraphs: [
      'Current application dates, fees and procedures require confirmation from the college. No application deadline or admission guarantee is published here.',
      'Send an enquiry through the admissions page to ask the college for the current application process and required documents.',
    ],
  },
  facilities: {
    title: 'Campus facilities',
    paragraphs: [
      'The official college website describes well-planned classrooms, assembly space, activity zones, library and laboratory facilities.',
      'It also lists sports areas, a first-aid room and purified drinking water. Please contact the college to confirm current availability.',
    ],
    image: campusImages.facilities,
  },
  privacy: {
    title: 'Privacy policy',
    paragraphs: [
      'When you submit an enquiry, the information you provide is stored by the college website so staff can respond to your request. Enquiry data is not displayed on public pages.',
      'This site should only be deployed after the institution confirms its data retention, access, and contact procedures. Contact the college to request access to or deletion of an enquiry you submitted.',
    ],
  },
  terms: {
    title: 'Terms of use',
    paragraphs: [
      'Information on this website is provided for general institutional information. Admission eligibility, fees, intake, deadlines and other time-sensitive details should be confirmed directly with the college.',
      'Official photographs and institutional materials remain the property of their respective rights holders. Contact the college for permission to reuse them.',
    ],
  },
};

export default function InstitutionInfoPage({ page }: { page: keyof typeof content }) {
  const item = content[page];
  return (
    <PageLayout>
      <main className="section-shell min-h-[65vh] py-16 sm:py-20">
        <p className="eyebrow">Sri Aurobindo College of Education</p>
        <h1 className="section-title mt-3 max-w-4xl">{item.title}</h1>
        {item.image && <img src={item.image} alt="Image from the official college website" width="1100" height="650" loading="lazy" className="mt-8 max-h-[480px] w-full object-cover" />}
        <div className="mt-8 max-w-3xl space-y-5 text-base leading-8 text-slate-700">{item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        {(page === 'eligibility' || page === 'apply') && <Link to="/admissions" className="mt-7 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">Contact admissions</Link>}
      </main>
    </PageLayout>
  );
}
