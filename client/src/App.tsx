import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import AcademicsPage from './pages/AcademicsPage';
import AchievementsPage from './pages/AchievementsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import CampusPage from './pages/CampusPage';
import ContactPage from './pages/ContactPage';
import ContentDetailPage from './pages/ContentDetailPage';
import CoursesPage from './pages/CoursesPage';
import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';
import HomePage from './pages/HomePage';
import InstitutionInfoPage from './pages/InstitutionInfoPage';
import NotFoundPage from './pages/NotFoundPage';
import NoticesPage from './pages/NoticesPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
});

function RouteTransition() {
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    const page = getPageMetadata(path);
    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', page.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', page.description);
    const isAdminPath = path === '/admin' || path.startsWith('/admin/');
    document.querySelector('meta[name="robots"]')?.setAttribute('content', isAdminPath ? 'noindex, nofollow' : 'index, follow');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const siteUrl = import.meta.env.VITE_SITE_URL;
    if (canonical && siteUrl) canonical.href = new URL(path, siteUrl).toString();
    else canonical?.remove();
  }, [location.pathname]);

  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <Routes>
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/history" element={<InstitutionInfoPage page="history" />} />
        <Route path="/about/principal" element={<InstitutionInfoPage page="principal" />} />
        <Route path="/academics" element={<AcademicsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<ContentDetailPage kind="courses" />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/admissions/eligibility" element={<InstitutionInfoPage page="eligibility" />} />
        <Route path="/admissions/how-to-apply" element={<InstitutionInfoPage page="apply" />} />
        <Route path="/campus" element={<CampusPage />} />
        <Route path="/facilities" element={<InstitutionInfoPage page="facilities" />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<ContentDetailPage kind="events" />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/notices/:slug" element={<ContentDetailPage kind="notices" />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<InstitutionInfoPage page="privacy" />} />
        <Route path="/terms" element={<InstitutionInfoPage page="terms" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </motion.div>
  );
}

function getPageMetadata(path: string) {
  const pages: Record<string, [string, string]> = {
    '/': ['Sri Aurobindo College of Education', 'Teacher education with a commitment to academic standards, professional ethics and innovative teaching.'],
    '/about': ['About the College', 'Learn about Sri Aurobindo College of Education, its history and commitment to teacher education.'],
    '/about/history': ['Institutional History', 'The verified history of Sri Aurobindo College of Education and its founding society.'],
    '/about/principal': ['Principal’s Message', 'Read the published message from Sri Aurobindo College of Education.'],
    '/academics': ['Academics', 'Academic information from Sri Aurobindo College of Education.'],
    '/courses': ['Courses', 'Explore published teacher education programmes and verified course information.'],
    '/admissions': ['Admissions', 'Contact the admissions team to confirm current eligibility and application details.'],
    '/admissions/eligibility': ['Admission Eligibility', 'Confirm current programme-specific eligibility directly with the college.'],
    '/admissions/how-to-apply': ['How to Apply', 'Ask the college for the current application process and required documents.'],
    '/campus': ['Campus Life', 'Explore campus life and facilities described by the college.'],
    '/facilities': ['Facilities', 'Facilities described by the official college website.'],
    '/gallery': ['Gallery', 'Photographs from the official Sri Aurobindo College of Education website.'],
    '/achievements': ['Achievements', 'Academic excellence, sports awards and teacher recognition at Sri Aurobindo College of Education.'],
    '/events': ['Events', 'Published events from Sri Aurobindo College of Education.'],
    '/notices': ['Notices', 'Official announcements and notices from Sri Aurobindo College of Education.'],
    '/contact': ['Contact', 'Contact Sri Aurobindo College of Education or submit an enquiry.'],
    '/privacy-policy': ['Privacy Policy', 'How this website handles submitted enquiry information.'],
    '/terms': ['Terms of Use', 'Terms for using the Sri Aurobindo College of Education website.'],
  };
  const exact = pages[path];
  const isAdminPath = path === '/admin' || path.startsWith('/admin/');
  const detailTitle = path.startsWith('/courses/') ? 'Course Details' : path.startsWith('/events/') ? 'Event Details' : path.startsWith('/notices/') ? 'Notice Details' : undefined;
  const [title, description] = exact || (isAdminPath ? ['Administration', 'Administrator access to manage college website content.'] : detailTitle ? [detailTitle, `Published ${detailTitle.toLowerCase()} from Sri Aurobindo College of Education.`] : ['Page Not Found', 'The requested page could not be found.']);
  const organization = 'Sri Aurobindo College of Education';
  return {
    title: title === organization ? title : `${title} | ${organization}`,
    description,
  };
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouteTransition />
    </QueryClientProvider>
  );
}
