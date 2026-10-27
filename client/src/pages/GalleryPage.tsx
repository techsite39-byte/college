import { PageLayout } from '../components/Layout';
import GalleryMosaic, { type GalleryItem } from '../components/GalleryMosaic';
import '../styles/gallery.css';

const galleryItems: GalleryItem[] = [
  {
    title: 'Annual Day',
    category: 'Annual Day',
    description: 'Memorable moments from annual day activities.',
    imageUrl: '/images/gallery-annual-day.jpg',
    altText: 'Students and faculty taking part in the college annual day celebration',
  },
  {
    title: 'Sports',
    category: 'Sports',
    description: 'Memorable moments from sports activities.',
    imageUrl: '/images/gallery-sports.jpg',
    altText: 'College students and staff gathered during a sports activity',
  },
  {
    title: 'Independence Day',
    category: 'Independence Day',
    description: 'Memorable moments from independence day activities.',
    imageUrl: '/images/gallery-independence-day.jpg',
    altText: 'Students and teachers gathered for a college Independence Day event',
  },
  {
    title: 'Science Fair',
    category: 'Science Fair',
    description: 'Memorable moments from science fair activities.',
    imageUrl: '/images/gallery-science-fair.jpg',
    altText: 'College students participating in an educational activity',
  },
  {
    title: 'Yoga Day',
    category: 'Yoga Day',
    description: 'Memorable moments from yoga day activities.',
    imageUrl: '/images/gallery-yoga-day.jpg',
    altText: 'Students taking part in a hands-on college activity',
  },
  {
    title: 'Classrooms',
    category: 'Classrooms',
    description: 'Memorable moments from classroom activities.',
    imageUrl: '/images/gallery-classrooms.jpg',
    altText: 'College students and faculty gathered for a learning event',
  },
  {
    title: 'Campus',
    category: 'Campus',
    description: 'Memorable moments from campus activities.',
    imageUrl: '/images/gallery-campus.jpg',
    altText: 'Students and staff at Sri Aurobindo College of Education',
  },
  {
    title: 'Library',
    category: 'Library',
    description: 'Memorable moments from library activities.',
    imageUrl: '/images/gallery-library.jpg',
    altText: 'College library and learning resources',
  },
];

export default function GalleryPage() {
  return (
    <PageLayout>
      <main className="gallery-page">
        <div className="gallery-page__inner">
          <h1 className="sr-only">College Gallery</h1>
          <GalleryMosaic items={galleryItems} />
        </div>
      </main>
    </PageLayout>
  );
}
