import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  GraduationCap,
  Play,
  RotateCcw,
  Star,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import EnquiryForm from '../components/EnquiryForm';
import GalleryMosaic, { type GalleryItem } from '../components/GalleryMosaic';
import { PageLayout } from '../components/Layout';
import { campusImages, visionOrbitImages } from '../data/siteContent';
import { apiRequest } from '../lib/api';
import '../styles/home.css';

type Course = {
  title: string;
  slug: string;
  shortDescription?: string;
  image?: string;
};

type EventItem = {
  title: string;
  slug: string;
  description?: string;
  startDate?: string;
};

type Notice = {
  title: string;
  slug: string;
  publishedAt?: string;
  category?: string;
};

type Achievement = {
  title: string;
  description?: string;
  category?: string;
  achievementDate?: string;
};

type HomeUpdate = {
  title: string;
  href: string;
  category?: string;
  date?: string;
  description?: string;
};

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.1, staggerChildren: 0.1 },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.2, 0.7, 0.2, 1] },
  },
};

const bentoContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const bentoItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] },
  },
};

function CinematicPhoto({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
}: {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
  loading?: 'eager' | 'lazy';
}) {
  const reduceMotion = useReducedMotion();
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: photoRef,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.09, 1.03]);
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [16, -16]);

  return (
    <motion.div
      ref={photoRef}
      className={className}
      initial={reduceMotion ? false : { opacity: 0.78 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <motion.div className={`${className}-layer`} style={{ scale, y }}>
        <img src={src} alt={alt} width={width} height={height} loading={loading} />
      </motion.div>
    </motion.div>
  );
}

function useOptionalContent<T>(key: string, path: string) {
  return useQuery<T[], Error>({
    queryKey: [key],
    queryFn: () => apiRequest<T[]>(path),
    retry: 1,
  });
}

function formatDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="home-section__heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="home-query-state home-skeleton" role="status" aria-label={`Loading ${label}`}>
      <span className="sr-only">Loading {label}…</span>
      <span className="home-skeleton__line" aria-hidden="true" />
      <span className="home-skeleton__line" aria-hidden="true" />
      <span className="home-skeleton__line" aria-hidden="true" />
    </div>
  );
}

function ErrorState({
  title,
  error,
  isRetrying,
  onRetry,
}: {
  title: string;
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="home-query-state home-query-state--error" role="alert">
      <strong>{title}</strong>
      <p>{error instanceof Error ? error.message : 'Please try again in a moment.'}</p>
      <button type="button" className="home-query-state__action" onClick={onRetry} disabled={isRetrying}>
        <RotateCcw size={15} aria-hidden="true" />
        {isRetrying ? 'Retrying…' : 'Try again'}
      </button>
    </div>
  );
}

function UpdateFeed({
  title,
  href,
  items,
  isLoading,
  isError,
  error,
  isRetrying,
  onRetry,
}: {
  title: string;
  href: string;
  items: HomeUpdate[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <section aria-labelledby={`home-${title.toLowerCase()}-title`}>
      <div className="home-section__topline">
        <h2 id={`home-${title.toLowerCase()}-title`} className="home-feed-title">{title}</h2>
        <Link className="home-link" to={href} aria-label={`View all ${title.toLowerCase()}`}>
          View all <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      {isLoading ? (
        <LoadingState label={title.toLowerCase()} />
      ) : isError ? (
        <ErrorState
          title={`${title} could not be loaded.`}
          error={error}
          isRetrying={isRetrying}
          onRetry={onRetry}
        />
      ) : items.length === 0 ? (
        <p className="home-query-state">There are no published {title.toLowerCase()} at this time.</p>
      ) : (
        <div className="home-update-list">
          {items.map((item) => (
            <Link key={`${title}-${item.href}`} to={item.href} className="home-update-list__item">
              <div className="home-update-list__meta">
              {formatDate(item.date) && <time dateTime={item.date}>{formatDate(item.date)}</time>}
                {item.category && <span>{item.category}</span>}
              </div>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const coursesQuery = useOptionalContent<Course>('courses', 'public/courses');
  const eventsQuery = useOptionalContent<EventItem>('events', 'public/events');
  const noticesQuery = useOptionalContent<Notice>('notices', 'public/notices');
  const achievementsQuery = useOptionalContent<Achievement>('achievements', 'public/achievements');
  const galleryQuery = useOptionalContent<GalleryItem>('gallery', 'public/gallery');

  const revealProps = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0.92, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.18 },
        transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] },
      };

  const courses = coursesQuery.data ?? [];
  const achievements = achievementsQuery.data ?? [];
  const featuredCourse = courses[0];
  const supportingCourses = courses.slice(1, 3);
  const events = (eventsQuery.data ?? []).slice(0, 3).map((item) => ({
    title: item.title,
    href: `/events/${item.slug}`,
    date: item.startDate,
    description: item.description,
  }));
  const notices = (noticesQuery.data ?? []).slice(0, 3).map((item) => ({
    title: item.title,
    href: `/notices/${item.slug}`,
    date: item.publishedAt,
    category: item.category,
  }));

  return (
    <PageLayout>
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero__inner">
            <motion.div
              className="home-hero__copy"
              variants={heroContainerVariants}
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
            >
              <motion.p variants={heroItemVariants} className="home-hero__eyebrow">Education for a brighter tomorrow</motion.p>
              <motion.h1 id="home-hero-title" variants={heroItemVariants}>
                Sri Aurobindo College of <span>Education</span>
              </motion.h1>
              <motion.p variants={heroItemVariants} className="home-hero__description">
                Empowering future educators with knowledge, values and a vision for a better tomorrow.
              </motion.p>
              <motion.div variants={heroItemVariants} className="home-hero__actions">
                <Link to="/courses" className="button-primary">
                  Explore Our Courses <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/campus" className="button-secondary">
                  <span className="home-hero__play"><Play size={12} fill="currentColor" aria-hidden="true" /></span>
                  Watch Campus Tour
                </Link>
              </motion.div>
              <motion.ul variants={heroItemVariants} className="home-hero__features" aria-label="College highlights">
                {[
                  { icon: <GraduationCap size={22} aria-hidden="true" />, label: 'Quality Education' },
                  { icon: <UsersRound size={22} aria-hidden="true" />, label: 'Experienced Faculty' },
                  { icon: <Building2 size={22} aria-hidden="true" />, label: 'Modern Campus' },
                  { icon: <Star size={22} fill="currentColor" aria-hidden="true" />, label: 'Holistic Development' },
                ].map((item) => (
                  <li key={item.label}>
                    <span className="home-hero__feature-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div
              className="home-hero__media"
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              variants={{
                hidden: { opacity: 0, scale: 1.04 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.9, delay: reduceMotion ? 0 : 0.35, ease: [0.2, 0.7, 0.2, 1] },
                },
              }}
            >
              <figure className="home-hero__photo">
                <img
                  src={campusImages.infrastructure}
                  alt="Sri Aurobindo College of Education building exterior"
                  width="900"
                  height="900"
                />
              </figure>
            </motion.div>
          </div>
          <svg className="home-hero__accent-curve" viewBox="0 0 1000 800" preserveAspectRatio="none" aria-hidden="true">
            <path d="M560 0 C560 170 505 245 505 405 C505 580 545 675 590 735" />
          </svg>
          <svg className="home-hero__wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 48 C150 4 260 90 440 82 C620 74 690 42 850 44 C1040 47 1120 84 1280 68 C1350 61 1400 39 1440 48 L1440 100 L0 100 Z" />
          </svg>
        </section>

        <section className="home-section home-highlights">
          <div className="home-shell">
            <motion.div {...revealProps} className="home-bento__heading">
              <SectionHeading
                eyebrow="Inside the college"
                title="Stories of learning, purpose and community."
                description="Explore Sri Aurobindo College of Education through its campus, people and published college activities."
              />
            </motion.div>
            <motion.div
              className="home-bento-grid"
              variants={bentoContainerVariants}
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
            >
              {[
                {
                  key: 'about',
                  eyebrow: 'Our story',
                  title: 'About Our College',
                  description: 'Established by the Sri Sai Mahathi Educational Society, the college is committed to teacher education.',
                  image: campusImages.building,
                  alt: 'Sri Aurobindo College of Education campus building',
                  href: '/about',
                },
                {
                  key: 'principal',
                  eyebrow: 'Leadership',
                  title: "Principal’s Message",
                  description: 'A message on academic excellence, empathy and social awareness.',
                  image: campusImages.principal,
                  alt: 'Principal’s message photograph published by the college',
                  href: '/about/principal',
                },
                {
                  key: 'events',
                  eyebrow: 'Campus life',
                  title: 'Events',
                  description: 'Literacy Day, cultural assemblies and annual celebrations.',
                  image: campusImages.events,
                  alt: 'College students participating in an official campus event',
                  href: '/events',
                },
                {
                  key: 'achievements',
                  eyebrow: 'Recognising effort',
                  title: 'Achievements',
                  description: 'Published stories of dedication, mentoring and innovation in teaching.',
                  image: campusImages.achievements,
                  alt: 'College activity featured in the official achievements collection',
                  href: '/achievements',
                },
                {
                  key: 'social',
                  eyebrow: 'Learning beyond the classroom',
                  title: 'Social Awareness',
                  description: 'Yoga, environmental drives and outreach support thoughtful citizenship.',
                  image: campusImages.socialAwareness,
                  alt: 'Students taking part in a college social-awareness activity',
                  href: '/campus',
                },
                {
                  key: 'gallery',
                  eyebrow: 'Photo stories',
                  title: 'College Photo Gallery',
                  description: 'Browse published moments from annual day, sports, Independence Day and campus life.',
                  image: campusImages.annualDay,
                  alt: 'Students celebrating an annual day event at the college',
                  href: '/gallery',
                },
              ].map((item) => (
                <motion.article
                  key={item.key}
                  className={`home-bento-card home-bento-card--${item.key}`}
                  variants={reduceMotion ? undefined : bentoItemVariants}
                  initial={reduceMotion ? false : undefined}
                >
                  <Link to={item.href} className="home-bento-card__link">
                    <CinematicPhoto
                      className="home-bento-card__photo"
                      src={item.image}
                      alt={item.alt}
                      width={900}
                      height={640}
                    />
                    <span className="home-bento-card__content">
                      <span className="home-bento-card__eyebrow">{item.eyebrow}</span>
                      <span className="home-bento-card__title">{item.title}</span>
                      <span className="home-bento-card__description">{item.description}</span>
                      <span className="home-bento-card__arrow" aria-hidden="true">
                        <ArrowRight size={18} />
                      </span>
                    </span>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="home-section home-about courses-opportunities" aria-labelledby="courses-opportunities-title">
          <div className="home-shell">
            <div className="courses-opportunities__top">
              <motion.div {...revealProps} className="courses-opportunities__intro">
                <p className="eyebrow">Courses &amp; Opportunities</p>
                <h2 id="courses-opportunities-title">Build Your Future with Quality Education</h2>
                <p>
                  Our B.Ed. and D.Ed. programmes are designed to develop skilled, compassionate
                  and confident educators who make a difference.
                </p>
                <Link to="/courses" className="courses-opportunities__cta">
                  Explore courses <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </motion.div>

              <motion.div
                className="courses-opportunities__notes"
                variants={bentoContainerVariants}
                initial={reduceMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.12 }}
                aria-label="Courses and learning opportunities"
                role="list"
              >
                {[
                  {
                    number: '01',
                    title: 'B.Ed. Programme',
                    description: 'Build teaching skills, professional values and leadership qualities for a brighter future.',
                    color: 'purple',
                  },
                  {
                    number: '02',
                    title: 'D.Ed. Programme',
                    description: 'Prepare to become competent and compassionate primary school teachers.',
                    color: 'coral',
                  },
                  {
                    number: '03',
                    title: 'Academic Excellence',
                    description: 'A learner-centred approach with practical exposure and holistic development.',
                    color: 'green',
                  },
                  {
                    number: '04',
                    title: 'Experienced Faculty',
                    description: 'Learn from qualified and dedicated educators with a passion for teaching.',
                    color: 'blue',
                  },
                  {
                    number: '05',
                    title: 'Supportive Environment',
                    description: 'A safe and inclusive space to learn, grow and achieve your goals.',
                    color: 'yellow',
                  },
                  {
                    number: '06',
                    title: 'Future Opportunities',
                    description: 'Open doors to a rewarding career in education and beyond.',
                    color: 'lavender',
                  },
                ].map((item, index) => (
                  <motion.article
                    key={item.number}
                    className={`courses-opportunities__note courses-opportunities__note--${item.color}`}
                    role="listitem"
                    variants={reduceMotion ? undefined : bentoItemVariants}
                    initial={reduceMotion ? false : undefined}
                  >
                    <span className="courses-opportunities__pin" aria-hidden="true" />
                    <span className="courses-opportunities__number">{item.number}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="courses-opportunities__note-mark" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </motion.article>
                ))}
              </motion.div>

              <motion.div
                {...revealProps}
                className="courses-opportunities__illustration"
                role="img"
                aria-label="Illustration of books, pencils and a graduation cap"
              >
                <svg viewBox="0 0 420 390" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M210 18C306 6 391 88 400 174C410 271 337 359 239 371C141 383 38 324 23 227C8 128 102 30 210 18Z" fill="#E9DFFF" />
                  <path d="M333 56C363 78 381 107 390 139" stroke="#B79AEF" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 8" />
                  <path d="M50 278C63 307 85 331 111 346" stroke="#B79AEF" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 8" />
                  <path d="M78 96L87 79M93 109L112 105M67 119L49 125M348 283L365 288M338 302L329 320" stroke="#E5A92E" strokeWidth="4" strokeLinecap="round" />
                  <ellipse cx="213" cy="326" rx="133" ry="20" fill="#C7B4EF" fillOpacity=".4" />
                  <g transform="rotate(-6 209 284)">
                    <rect x="96" y="274" width="226" height="42" rx="8" fill="#5526A8" />
                    <path d="M104 281H313V309H104C99.6 309 96 305.4 96 301V289C96 284.6 99.6 281 104 281Z" fill="#8057E8" />
                    <path d="M111 288H311" stroke="#B89AF1" strokeWidth="3" strokeLinecap="round" />
                    <path d="M115 312H314" stroke="#392078" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <g transform="rotate(5 206 254)">
                    <rect x="100" y="235" width="218" height="43" rx="8" fill="#E8795E" />
                    <path d="M108 241H308V270H108C103.6 270 100 266.4 100 262V249C100 244.6 103.6 241 108 241Z" fill="#FF9B7E" />
                    <path d="M111 249H305" stroke="#FFD2C4" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <g transform="rotate(-3 208 215)">
                    <rect x="91" y="196" width="233" height="45" rx="8" fill="#EAB944" />
                    <path d="M99 202H315V232H99C94.6 232 91 228.4 91 224V210C91 205.6 94.6 202 99 202Z" fill="#FFD66E" />
                    <path d="M104 211H313" stroke="#FFF0BB" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <path d="M306 267L338 123" stroke="#2F6C93" strokeWidth="13" strokeLinecap="round" />
                  <path d="M337 125L344 95L355 127L337 125Z" fill="#E7B63D" />
                  <path d="M286 275L296 126" stroke="#E8785D" strokeWidth="12" strokeLinecap="round" />
                  <path d="M295 128L301 99L307 129L295 128Z" fill="#E7B63D" />
                  <path d="M166 141L213 109L274 143L224 176L166 141Z" fill="#34236F" />
                  <path d="M186 150L224 171L263 149" stroke="#6D51B1" strokeWidth="3" strokeLinecap="round" />
                  <path d="M213 109L213 147" stroke="#E6B638" strokeWidth="2" />
                  <circle cx="213" cy="149" r="5" fill="#E6B638" />
                  <path d="M274 143V168" stroke="#E6B638" strokeWidth="2" />
                  <path d="M274 168C267 175 267 183 274 187C281 183 281 175 274 168Z" fill="#E6B638" />
                  <path d="M140 122L151 116M126 139L137 136M284 103L294 96" stroke="#E5A92E" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="110" cy="170" r="4" fill="#FF7657" />
                  <circle cx="319" cy="188" r="5" fill="#8057E8" />
                  <circle cx="127" cy="194" r="3" fill="#E5A92E" />
                </svg>
              </motion.div>
            </div>

            <div className="courses-opportunities__panels">
              <motion.section {...revealProps} className="courses-opportunities__panel courses-opportunities__panel--highlights">
                <p className="courses-opportunities__panel-eyebrow">Course Highlights</p>
                <h3>What You’ll Gain</h3>
                <ul>
                  {[
                    'NCTE Approved Curriculum',
                    'Experienced Faculty Members',
                    'Educational Technology Training',
                    'Micro Teaching & Internship Programs',
                    'Lesson Planning & Classroom Management',
                    'Educational Psychology',
                    'Research-Based Learning',
                    'Practical School Experience',
                    'Career Guidance & Professional Development',
                  ].map((item) => <li key={item}>{item}</li>)}
                </ul>
              </motion.section>

              <motion.section {...revealProps} className="courses-opportunities__panel courses-opportunities__panel--careers">
                <p className="courses-opportunities__panel-eyebrow">Career Opportunities</p>
                <h3>Graduates can build successful careers as:</h3>
                <ul>
                  {[
                    'High School Teacher',
                    'Secondary School Teacher',
                    'Educational Consultant',
                    'Academic Coordinator',
                    'School Administrator',
                    'Curriculum Developer',
                    'Education Researcher',
                    'Competitive Exam Aspirant',
                    'Higher Education Opportunities (M.Ed., NET, Ph.D.)',
                  ].map((item) => <li key={item}>{item}</li>)}
                </ul>
              </motion.section>
            </div>
          </div>
        </section>

        <section className="home-section home-vision-orbit">
          <div className="home-shell">
            <div className="home-vision-orbit__stage">
              <div className="home-vision-orbit__track" role="list" aria-label="Photographs of college campus and activities">
                {visionOrbitImages.map((image, index) => (
                  <div
                    key={image.src}
                    className={`home-vision-orbit__slot home-vision-orbit__slot--${index + 1}`}
                    role="listitem"
                  >
                    <div className="home-vision-orbit__counter">
                      <figure className="home-vision-orbit__frame">
                        <img src={image.src} alt={image.alt} width="450" height="360" loading="lazy" />
                      </figure>
                    </div>
                  </div>
                ))}
              </div>

              <motion.div {...revealProps} className="home-vision-orbit__content">
                <p className="eyebrow">Our Vision &amp; Mission</p>
                <h2>Inspiring Future Educators. Shaping Tomorrow.</h2>
                <p className="home-vision-orbit__description">
                  Discover an educational environment that nurtures responsible, compassionate and
                  capable teachers through learning, practical experience and a commitment to
                  educational progress.
                </p>
                <Link to="/about" className="home-vision-orbit__button">
                  Explore Our College <ArrowRight size={17} aria-hidden="true" />
                </Link>

                <div className="home-vision-orbit__features">
                  <article>
                    <span className="home-vision-orbit__feature-mark" aria-hidden="true">01</span>
                    <h3>Purpose-Driven Learning</h3>
                    <p>Preparing responsible and socially committed educators.</p>
                  </article>
                  <article>
                    <span className="home-vision-orbit__feature-mark" aria-hidden="true">02</span>
                    <h3>Practical Experience</h3>
                    <p>Learning through teaching practice and educational activities.</p>
                  </article>
                  <article>
                    <span className="home-vision-orbit__feature-mark" aria-hidden="true">03</span>
                    <h3>Values &amp; Growth</h3>
                    <p>Building empathy, resilience and social awareness.</p>
                  </article>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="home-section home-programs home-section--dark">
          <div className="home-shell">
            <div className="home-programs__topline">
              <SectionHeading
                eyebrow="Academic programmes"
                title="Explore published teacher education programmes."
                description="Course details are shown as published by the college. Contact admissions to confirm current eligibility and availability."
              />
              <Link to="/courses" className="home-link">
                All courses <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {coursesQuery.isLoading && <LoadingState label="courses" />}
            {coursesQuery.isError && (
              <ErrorState
                title="Published course information could not be loaded."
                error={coursesQuery.error}
                isRetrying={coursesQuery.isFetching}
                onRetry={() => void coursesQuery.refetch()}
              />
            )}
            {!coursesQuery.isLoading && !coursesQuery.isError && courses.length === 0 && (
              <div className="home-query-state">
                No courses are currently published online. Please enquire directly for verified
                programme information.
                <div>
                  <Link to="/admissions" className="home-query-state__action">
                    Ask admissions <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
            {!coursesQuery.isLoading && !coursesQuery.isError && featuredCourse && (
              <div className="home-course-grid">
                <motion.article {...revealProps} className="home-course-feature">
                  <img
                    className="home-course-feature__image"
                    src={featuredCourse.image || campusImages.infrastructure}
                    alt=""
                    width="900"
                    height="600"
                    loading="lazy"
                  />
                  <div className="home-course-feature__body">
                    <p className="eyebrow">Featured programme</p>
                    <h3>{featuredCourse.title}</h3>
                    {featuredCourse.shortDescription && <p>{featuredCourse.shortDescription}</p>}
                    <Link to={`/courses/${featuredCourse.slug}`} className="home-link">
                      Programme details <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </motion.article>
                <div className="home-course-stack">
                  {supportingCourses.map((course) => (
                    <motion.article key={course.slug} {...revealProps} className="home-course-support">
                      <div className="home-course-support__body">
                        <p className="eyebrow">Teacher education</p>
                        <h3>{course.title}</h3>
                        {course.shortDescription && <p>{course.shortDescription}</p>}
                        <Link to={`/courses/${course.slug}`} className="home-link">
                          Programme details <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="home-section home-achievements">
          <div className="home-shell">
            <div className="home-section__topline">
              <SectionHeading
                eyebrow="College achievements"
                title="Celebrating accomplishments published by the college."
                description="Only achievements confirmed and published through the college’s content are shown here."
              />
              <Link to="/achievements" className="home-link">
                View all <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {achievementsQuery.isLoading && <LoadingState label="achievements" />}
            {achievementsQuery.isError && (
              <ErrorState
                title="Achievements could not be loaded."
                error={achievementsQuery.error}
                isRetrying={achievementsQuery.isFetching}
                onRetry={() => void achievementsQuery.refetch()}
              />
            )}
            {!achievementsQuery.isLoading && !achievementsQuery.isError && achievements.length === 0 && (
              <p className="home-query-state">
                There are no achievements published yet. Visit the achievements page for future
                updates.
              </p>
            )}
            {!achievementsQuery.isLoading && !achievementsQuery.isError && achievements.length > 0 && (
              <div className="home-achievements__grid">
                {achievements.slice(0, 3).map((item, index) => (
                  <motion.article
                    key={`${item.title}-${item.achievementDate || index}`}
                    {...revealProps}
                    className="home-achievement-card"
                  >
                    <p className="home-achievement-card__meta">
                      {[item.category, formatDate(item.achievementDate)].filter(Boolean).join(' · ') || 'Achievement'}
                    </p>
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="home-section home-gallery">
          <div className="home-shell">
            <div className="home-gallery__topline">
              <SectionHeading
                eyebrow="Campus gallery"
                title="A closer look at college life."
                description="Browse photographs published by the college. Use the category filters to explore the collection."
              />
              <Link to="/gallery" className="home-link">
                Full gallery <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {galleryQuery.isLoading && <LoadingState label="gallery images" />}
            {galleryQuery.isError && (
              <ErrorState
                title="Gallery images could not be loaded."
                error={galleryQuery.error}
                isRetrying={galleryQuery.isFetching}
                onRetry={() => void galleryQuery.refetch()}
              />
            )}
            {!galleryQuery.isLoading && !galleryQuery.isError && galleryQuery.data?.length === 0 && (
              <p className="home-query-state">No gallery images have been published yet.</p>
            )}
            {!galleryQuery.isLoading && !galleryQuery.isError && galleryQuery.data && galleryQuery.data.length > 0 && (
              <GalleryMosaic items={galleryQuery.data} compact maxItems={6} />
            )}
          </div>
        </section>

        <section className="home-section home-updates">
          <div className="home-shell">
            <div className="home-updates__grid">
              <UpdateFeed
                title="Events"
                href="/events"
                items={events}
                isLoading={eventsQuery.isLoading}
                isError={eventsQuery.isError}
                error={eventsQuery.error}
                isRetrying={eventsQuery.isFetching}
                onRetry={() => void eventsQuery.refetch()}
              />
              <UpdateFeed
                title="Notices"
                href="/notices"
                items={notices}
                isLoading={noticesQuery.isLoading}
                isError={noticesQuery.isError}
                error={noticesQuery.error}
                isRetrying={noticesQuery.isFetching}
                onRetry={() => void noticesQuery.refetch()}
              />
            </div>
          </div>
        </section>

        <section className="home-section home-cta">
            <CinematicPhoto
              className="home-cta__backdrop"
              src={campusImages.infrastructure}
              alt=""
              width={1600}
              height={900}
            />
            <div className="home-shell home-cta__grid">
            <div className="home-cta__copy">
              <p className="eyebrow">Admissions enquiry</p>
              <h2>Take the next step in your teaching journey.</h2>
              <p>
                Ask the college about current eligibility, programme availability, and the
                application process.
              </p>
              <div className="home-cta__links">
                <Link to="/admissions" className="button-primary">
                  Admissions information <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/contact" className="button-secondary">
                  Contact the college <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="home-cta__form">
              <h3>Send an enquiry</h3>
              <EnquiryForm compact />
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
