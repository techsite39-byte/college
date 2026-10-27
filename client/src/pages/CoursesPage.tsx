import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, School, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '../components/Layout';
import { apiRequest } from '../lib/api';
import '../styles/courses.css';

type PublishedCourse = {
  title: string;
  slug: string;
  shortDescription: string;
  eligibility?: string;
  duration?: string;
  intake?: string;
};

type CourseContent = {
  slug: string;
  acronym: string;
  title: string;
  subtitle: string;
  description: string[];
  highlights: string[];
  careers: string[];
};

const courses: CourseContent[] = [
  {
    slug: 'bed',
    acronym: 'B.Ed.',
    title: 'Bachelor of Education',
    subtitle: 'Prepare to Become an Inspiring Professional Teacher.',
    description: [
      'The Bachelor of Education (B.Ed.) program is offered by Sri Aurobindo College of Education, established in 2016 with Government approval and NCTE recognition.',
      'The course is designed to develop competent, confident, and socially responsible teachers capable of meeting the evolving needs of modern education.',
      'Students receive comprehensive training in educational psychology, curriculum planning, classroom management, assessment techniques, educational technology, and professional ethics.',
    ],
    highlights: [
      'NCTE Approved Curriculum',
      'Experienced Faculty Members',
      'Smart Classrooms',
      'Educational Technology Training',
      'Micro Teaching & Internship Programs',
      'Lesson Planning & Classroom Management',
      'Educational Psychology',
      'Research-Based Learning',
      'Practical School Experience',
      'Career Guidance & Professional Development',
    ],
    careers: [
      'High School Teacher',
      'Secondary School Teacher',
      'Educational Consultant',
      'Academic Coordinator',
      'School Administrator',
      'Curriculum Developer',
      'Education Researcher',
      'Competitive Exam Aspirant',
      'Higher Education Opportunities (M.Ed., NET, Ph.D.)',
    ],
  },
  {
    slug: 'ded',
    acronym: 'D.El.Ed.',
    title: 'Diploma in Elementary Education',
    subtitle: 'Build a Strong Foundation in Elementary Teaching.',
    description: [
      'The Diploma in Elementary Education (D.El.Ed.) is a comprehensive teacher training program offered by Sri Aurobindo College of Elementary Education, established in 2012 under the Sri Sai Mahathi Educational Society.',
      'This program prepares aspiring teachers to educate children at the primary and upper primary school levels while nurturing creativity, communication skills, leadership qualities, and child-centered teaching practices.',
    ],
    highlights: [
      'NCTE Recognized Program',
      'Experienced and Qualified Faculty',
      'Modern Teaching Methodologies',
      'Child Psychology & Educational Development',
      'Teaching Practice in Schools',
      'Digital Learning Resources',
      'Personality & Communication Skills Development',
      'Library and Learning Resource Centre',
      'Continuous Internal Assessment',
      'Practical Classroom Experience',
    ],
    careers: [
      'Primary School Teacher',
      'Upper Primary Teacher',
      'Educational Facilitator',
      'Academic Coordinator',
      'Private School Teacher',
      'Educational Content Developer',
      'Tutor or Coaching Faculty',
    ],
  },
];

function OpportunityList({ items, variant }: { items: string[]; variant: 'highlight' | 'career' }) {
  return (
    <ul className={`courses-page__list courses-page__list--${variant}`}>
      {items.map((item) => (
        <li key={item}>
          <span aria-hidden="true">{variant === 'highlight' ? '✓' : '↗'}</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function CourseSection({
  course,
  index,
  published,
}: {
  course: CourseContent;
  index: number;
  published?: PublishedCourse;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      id={course.slug}
      className={`courses-page__course courses-page__course--${course.slug}`}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.55, delay: index * 0.08 }}
    >
      <header className="courses-page__course-header">
        <span className="courses-page__course-icon" aria-hidden="true">
          {index === 0 ? <GraduationCap size={24} /> : <School size={24} />}
        </span>
        <div>
          <p className="courses-page__course-label">Teacher education programme <span>{course.acronym}</span></p>
          <h2>{course.title}</h2>
          <p className="courses-page__subtitle">{course.subtitle}</p>
        </div>
      </header>

      <div className="courses-page__course-body">
        <div className="courses-page__overview">
          <h3><BookOpen size={18} aria-hidden="true" /> Programme overview</h3>
          {course.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {published && (
            <dl className="courses-page__published-details" aria-label="Additional published course details">
              {published.eligibility && <div><dt>Eligibility</dt><dd>{published.eligibility}</dd></div>}
              {published.duration && <div><dt>Duration</dt><dd>{published.duration}</dd></div>}
              {published.intake && <div><dt>Published intake</dt><dd>{published.intake}</dd></div>}
            </dl>
          )}
          <Link to="/admissions" className="courses-page__admissions-link">
            Ask about admissions <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="courses-page__lists">
          <section className="courses-page__list-card">
            <h3><Sparkles size={17} aria-hidden="true" /> Course highlights</h3>
            <OpportunityList items={course.highlights} variant="highlight" />
          </section>
          <section className="courses-page__list-card courses-page__list-card--careers">
            <h3><BriefcaseBusiness size={17} aria-hidden="true" /> Career opportunities</h3>
            <OpportunityList items={course.careers} variant="career" />
          </section>
        </div>
      </div>
    </motion.article>
  );
}

export default function CoursesPage() {
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiRequest<PublishedCourse[]>('public/courses'),
    retry: false,
  });

  const publishedCourses = coursesQuery.data ?? [];
  const publishedBed = publishedCourses.find(({ slug }) => slug === 'bed');
  const publishedDed = publishedCourses.find(({ slug }) => slug === 'ded' || slug === 'd-el-ed' || slug === 'deled');

  return (
    <PageLayout>
      <main className="courses-page">
        <section className="courses-page__hero">
          <div className="courses-page__hero-inner">
            <motion.div
              className="courses-page__intro"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.55 }}
            >
              <p className="courses-page__eyebrow">Courses Offered</p>
              <h1>Empowering Future Educators Through Quality Teacher Education</h1>
              <p>
                At Sri Aurobindo Educational Institutions, we believe that great teachers shape great
                nations. Our teacher education programs are designed to equip aspiring educators with
                the knowledge, professional skills, ethical values, and practical teaching experience
                required to excel in today&apos;s dynamic educational environment.
              </p>
              <p>
                Recognized by the National Council for Teacher Education (NCTE), Bengaluru, our
                institutions follow a student-centered curriculum that combines academic excellence
                with hands-on classroom training, innovative teaching methodologies, and personality
                development.
              </p>
              <div className="courses-page__hero-actions">
                <a href="#bed" className="courses-page__hero-link">Explore programmes <ArrowRight size={16} aria-hidden="true" /></a>
                <span><GraduationCap size={17} aria-hidden="true" /> B.Ed. &amp; D.El.Ed.</span>
              </div>
            </motion.div>

            <motion.figure
              className="courses-page__hero-image"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.75, delay: 0.12 }}
            >
              <img
                src={imageFailed ? '/images/college-classroom.jpg' : '/images/courses-campus.jpg'}
                alt={imageFailed
                  ? 'College educators and students at Sri Aurobindo Educational Institutions'
                  : 'Educators reviewing learning resources at Sri Aurobindo College of Education'}
                width="1200"
                height="800"
                onError={() => setImageFailed(true)}
              />
              <figcaption><span aria-hidden="true">SA</span> Sri Aurobindo Educational Institutions</figcaption>
            </motion.figure>
          </div>
        </section>

        <section className="courses-page__programmes" aria-label="Teacher education programmes">
          <div className="courses-page__section-heading">
            <p className="courses-page__eyebrow">Learn with purpose</p>
            <h2>Programmes designed to shape educators</h2>
            <p>Build the knowledge, practice, and professional confidence to make a difference in education.</p>
          </div>
          {coursesQuery.isError && (
            <p className="courses-page__api-note" role="status">
              Showing the college course information available on this page. Live programme details are temporarily unavailable.
            </p>
          )}
          {coursesQuery.isLoading && <p className="courses-page__loading" role="status">Loading published course details…</p>}
          <div className="courses-page__course-list">
            <CourseSection course={courses[0]} index={0} published={publishedBed} />
            <CourseSection course={courses[1]} index={1} published={publishedDed} />
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
