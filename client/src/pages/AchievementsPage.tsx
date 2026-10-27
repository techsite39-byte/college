import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import '../styles/achievements.css';

type AchievementCard = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

const featuredAchievements: AchievementCard[] = [
  {
    title: 'ACADEMIC EXCELLENCE',
    description: 'Students are recognized for consistent performance and subject mastery.',
    image: '/images/student-achievements.jpg',
    imageAlt: 'Students and educators celebrating Children’s Day at the college',
  },
  {
    title: 'SPORTS AWARDS',
    description: 'Teams participate in athletics, games and inter-school competitions.',
    image: '/images/achievements-sports.jpg',
    imageAlt: 'College students and staff gathered for an awards presentation',
  },
  {
    title: 'TEACHER RECOGNITION',
    description: 'Faculty achievements reflect dedication, mentoring and innovation.',
    image: '/images/achievements-teacher.jpg',
    imageAlt: 'College faculty and students gathered to recognize a teacher',
  },
];

function FeaturedAchievement({ item, onReadMore }: {
  item: AchievementCard;
  onReadMore: (achievement: AchievementCard) => void;
}) {
  return (
    <article className="achievements-card">
      <img
        className="achievements-card__image"
        src={item.image}
        alt={item.imageAlt}
        width="900"
        height="598"
        loading="lazy"
      />
      <div className="achievements-card__body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <button
          className="achievements-card__button"
          type="button"
          aria-haspopup="dialog"
          onClick={() => onReadMore(item)}
        >
          Read More
        </button>
      </div>
    </article>
  );
}

export default function AchievementsPage() {
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementCard | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedAchievement && dialog && !dialog.open) dialog.showModal();
    if (!selectedAchievement && dialog?.open) dialog.close();
  }, [selectedAchievement]);

  return (
    <PageLayout>
      <main className="achievements-page">
        <section className="achievements-banner" aria-labelledby="achievements-page-title">
          <img
            className="achievements-banner__image"
            src="/images/student-achievements.jpg"
            alt=""
            width="900"
            height="598"
          />
          <div className="achievements-banner__overlay" aria-hidden="true" />
          <div className="achievements-banner__content">
            <h1 id="achievements-page-title">Achievements</h1>
            <nav className="achievements-banner__breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Achievements</span>
            </nav>
          </div>
        </section>

        <section className="achievements-section" aria-labelledby="achievements-section-title">
          <div className="achievements-section__inner">
            <h2 id="achievements-section-title">ACHIEVEMENTS</h2>
            <div className="achievements-grid">
              {featuredAchievements.map((item) => (
                <FeaturedAchievement
                  key={item.title}
                  item={item}
                  onReadMore={setSelectedAchievement}
                />
              ))}
            </div>
          </div>
        </section>

        <dialog
          ref={dialogRef}
          className="achievements-dialog"
          aria-labelledby="achievements-dialog-title"
          aria-describedby="achievements-dialog-description"
          onCancel={(event) => {
            event.preventDefault();
            setSelectedAchievement(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setSelectedAchievement(null);
            }
          }}
          onClose={() => setSelectedAchievement(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedAchievement(null);
          }}
        >
          {selectedAchievement && (
            <div className="achievements-dialog__content">
              <button
                type="button"
                className="achievements-dialog__close"
                aria-label="Close achievement details"
                onClick={() => setSelectedAchievement(null)}
              >
                <X size={20} aria-hidden="true" />
              </button>
              <img
                src={selectedAchievement.image}
                alt={selectedAchievement.imageAlt}
                width="900"
                height="598"
              />
              <div className="achievements-dialog__body">
                <p className="achievements-card__eyebrow">Sri Aurobindo College of Education</p>
                <h2 id="achievements-dialog-title">{selectedAchievement.title}</h2>
                <p id="achievements-dialog-description">{selectedAchievement.description}</p>
              </div>
            </div>
          )}
        </dialog>
      </main>
    </PageLayout>
  );
}
