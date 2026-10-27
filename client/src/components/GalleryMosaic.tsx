import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/gallery.css';

export type GalleryItem = {
  title: string;
  imageUrl: string;
  altText?: string;
  category?: string;
  caption?: string;
  description?: string;
};

type GalleryMosaicProps = {
  items: GalleryItem[];
  compact?: boolean;
  maxItems?: number;
};

const galleryCategories = [
  'All',
  'Annual Day',
  'Sports',
  'Independence Day',
  'Science Fair',
  'Yoga Day',
  'Classrooms',
  'Campus',
  'Library',
];

function handleGalleryImageError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (!image.src.endsWith('/images/college-campus.jpg')) {
    image.src = '/images/college-campus.jpg';
  }
}

function GalleryTile({
  item,
  index,
  compact,
  onSelect,
}: {
  item: GalleryItem;
  index: number;
  compact: boolean;
  onSelect: (button: HTMLButtonElement) => void;
}) {
  const reduceMotion = useReducedMotion();
  const tileRef = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ['start end', 'end start'],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.07, 1.02]);

  return (
    <motion.button
      ref={tileRef}
      type="button"
      className="gallery-mosaic__tile"
      aria-label={`Open image: ${item.altText || item.title}`}
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : Math.min(index * 0.06, 0.3),
        ease: [0.2, 0.7, 0.2, 1],
      }}
      onClick={(event) => onSelect(event.currentTarget)}
    >
      <motion.span className="gallery-mosaic__image" style={{ scale: compact ? imageScale : undefined }}>
        <img
          src={item.imageUrl}
          alt={item.altText || item.title}
          width="720"
          height="560"
          loading="lazy"
          onError={handleGalleryImageError}
        />
      </motion.span>
      {compact ? (
        <span>{item.title}</span>
      ) : (
        <span className="gallery-mosaic__caption">
          <strong>{item.title}</strong>
          {item.description && <small>{item.description}</small>}
        </span>
      )}
    </motion.button>
  );
}

export default function GalleryMosaic({ items, compact = false, maxItems }: GalleryMosaicProps) {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selectedRef = useRef(selected);
  const reduceMotion = useReducedMotion();
  selectedRef.current = selected;

  const categories = useMemo(() => compact
    ? ['All', ...new Set(items.map((item) => item.category || 'Campus'))]
    : galleryCategories, [compact, items]);
  const visibleItems = useMemo(
    () => items.filter((item) => category === 'All' || (item.category || 'Campus') === category),
    [items, category],
  );
  const displayedItems = maxItems ? visibleItems.slice(0, maxItems) : visibleItems;
  const isOpen = selected !== null;

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      const current = selectedRef.current;
      if (event.key === 'Escape') {
        event.preventDefault();
        setSelected(null);
      } else if (event.key === 'ArrowRight' && displayedItems.length > 1) {
        event.preventDefault();
        setSelected((index) => index === null ? null : (index + 1) % displayedItems.length);
      } else if (event.key === 'ArrowLeft' && displayedItems.length > 1) {
        event.preventDefault();
        setSelected((index) => index === null ? null : (index - 1 + displayedItems.length) % displayedItems.length);
      } else if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
          event.preventDefault();
          first.focus();
        }
      }
      if (current === null) return;
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, displayedItems.length]);

  return (
    <div className={`gallery-mosaic${compact ? ' gallery-mosaic--compact' : ' gallery-mosaic--cards'}`}>
      <div className="gallery-mosaic__filters" role="group" aria-label="Filter gallery by category">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            className={`gallery-mosaic__filter${category === item ? ' is-active' : ''}`}
            onClick={() => {
              setCategory(item);
              setSelected(null);
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {displayedItems.length > 0 ? (
        <div className="gallery-mosaic__grid">
          {displayedItems.map((item, index) => (
            <GalleryTile
              key={`${item.title}-${item.imageUrl}`}
              item={item}
              index={index}
              compact={compact}
              onSelect={(button) => {
                triggerRef.current = button;
                setSelected(index);
              }}
            />
          ))}
        </div>
      ) : (
        <p className="gallery-mosaic__empty">No gallery images have been published in this category.</p>
      )}

      <AnimatePresence>
        {selected !== null && displayedItems[selected] && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`College gallery image: ${displayedItems[selected].title}`}
            className="gallery-lightbox"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setSelected(null);
            }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="gallery-lightbox__control gallery-lightbox__close"
              aria-label="Close gallery image"
              onClick={() => setSelected(null)}
            >
              <X size={22} aria-hidden="true" />
            </button>
            {displayedItems.length > 1 && (
              <button
                type="button"
                className="gallery-lightbox__control gallery-lightbox__previous"
                aria-label="Previous image"
                onClick={() => setSelected((index) => index === null ? null : (index - 1 + displayedItems.length) % displayedItems.length)}
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
            )}
            <motion.figure
              className="gallery-lightbox__figure"
              initial={reduceMotion ? false : { scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={reduceMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
            >
              <img
                src={displayedItems[selected].imageUrl}
                alt={displayedItems[selected].altText || displayedItems[selected].title}
                onError={handleGalleryImageError}
              />
              <figcaption>{displayedItems[selected].caption || displayedItems[selected].title}</figcaption>
            </motion.figure>
            {displayedItems.length > 1 && (
              <button
                type="button"
                className="gallery-lightbox__control gallery-lightbox__next"
                aria-label="Next image"
                onClick={() => setSelected((index) => index === null ? null : (index + 1) % displayedItems.length)}
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
