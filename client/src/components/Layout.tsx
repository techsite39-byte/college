import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Mail, MapPin, Menu, Phone, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import '../styles/footer.css';
import '../styles/header.css';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Courses', to: '/courses' },
  { label: 'Achievements', to: '/achievements' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'Campus Life', to: '/campus' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

type SiteSettings = {
  institutionName?: string;
  contactDetails?: { phone?: string; email?: string; website?: string };
  address?: string;
  announcement?: { text?: string; link?: string; isActive?: boolean };
};

export function PageLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => apiRequest<SiteSettings>('public/site-settings'),
    retry: 1,
  });

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: reduceMotion === false ? 'smooth' : 'auto' });
  }, [location.pathname, reduceMotion]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      menuButton?.focus();
    };
  }, [mobileOpen]);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 12);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  const announcement = settings?.announcement;
  const announcementPath = announcement?.link?.startsWith('/') && !announcement.link.startsWith('//')
    ? announcement.link
    : undefined;
  const announcementUrl = announcement?.link?.startsWith('https://')
    ? announcement.link
    : undefined;
  const searchResults = searchTerm.trim()
    ? navItems.filter((item) => item.label.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-ivory text-navy">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {announcement?.isActive && announcement.text && (
        <div className="bg-navy px-4 py-2 text-center text-xs text-white sm:text-sm">
          {announcementPath ? (
            <Link to={announcementPath} className="inline-flex items-center gap-1 hover:text-gold-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright">
              {announcement.text}<ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          ) : announcementUrl ? (
            <a href={announcementUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-gold-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright">
              {announcement.text}<ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ) : announcement.text}
        </div>
      )}
      <header className={`college-header${scrolled ? ' college-header--scrolled' : ''}`}>
        <div className="college-header__utility">
          <div className="college-header__utility-inner">
            <p>Teacher Education <span aria-hidden="true">•</span> Nalgonda, Telangana</p>
            <Link to="/contact"><Phone size={13} aria-hidden="true" /> Contact Us</Link>
          </div>
        </div>

        <div className="college-header__main">
          <div className="college-header__main-inner">
            <Link to="/" aria-label="Sri Aurobindo College of Education home" className="college-header__brand">
              <span aria-hidden="true" className="college-header__monogram">SA</span>
              <span className="college-header__brand-copy">
                <span className="college-header__brand-name">Sri Aurobindo College</span>
                <span className="college-header__brand-subtitle">D.Ed &amp; B.Ed <span aria-hidden="true">|</span> Nalgonda, Telangana</span>
              </span>
            </Link>

            <nav aria-label="Main navigation" className="college-header__desktop-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `college-header__nav-link${isActive ? ' is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="college-header__actions">
              <Link to="/admissions" className="college-header__apply">
                Apply Now <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <button
                type="button"
                aria-label={searchOpen ? 'Close site search' : 'Open site search'}
                aria-expanded={searchOpen}
                aria-controls="site-search-panel"
                className="college-header__icon-button"
                onClick={() => setSearchOpen((open) => !open)}
              >
                {searchOpen ? <X size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
              </button>
              <button
                ref={menuButtonRef}
                type="button"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
                className="college-header__menu-toggle"
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <div className="college-header__accent" aria-hidden="true" />
        </div>

        {searchOpen && (
          <div id="site-search-panel" className="border-t border-navy/10 bg-white shadow-header">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6">
              <label htmlFor="site-search" className="sr-only">Search site pages</label>
              <div className="relative max-w-xl">
                <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="site-search"
                  type="search"
                  autoFocus
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setSearchOpen(false);
                  }}
                  placeholder="Search pages"
                  className="w-full rounded-full border border-navy/20 bg-white py-3 pl-10 pr-4 text-sm text-navy placeholder:text-slate-500 focus-visible:border-gold"
                />
              </div>
              <div className="mt-3 max-w-xl" aria-live="polite">
                {searchTerm.trim() && searchResults.length > 0 && (
                  <nav aria-label="Search results" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {searchResults.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setSearchOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                )}
                {searchTerm.trim() && searchResults.length === 0 && (
                  <p className="text-sm text-slate-600">No pages match “{searchTerm.trim()}”.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              initial={reduceMotion === false ? { opacity: 0, y: -8 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion === false ? { opacity: 0, y: -8 } : undefined}
              transition={reduceMotion === false ? { duration: 0.18, ease: [0.2, 0.7, 0.2, 1] } : { duration: 0 }}
              className="college-header__mobile-nav"
            >
              <div className="college-header__mobile-inner">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => `college-header__mobile-link${isActive ? ' is-active' : ''}`}>
                    {item.label}
                  </NavLink>
                ))}
                <Link to="/admissions" onClick={() => setMobileOpen(false)} className="college-header__mobile-apply">
                  Apply Now <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <div id="main-content" tabIndex={-1}>
        {children}
      </div>

      <motion.footer
        className="college-footer"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <svg className="college-footer__wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 44C230 80 420 80 650 51C900 19 1120 14 1440 52V90H0V44Z" />
        </svg>
        <div className="college-footer__ornament" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="section-shell college-footer__main">
          <section className="college-footer__brand" aria-labelledby="college-footer-title">
            <Link to="/" className="college-footer__identity" aria-label="Sri Aurobindo College of Education home">
              <span className="college-footer__seal" aria-hidden="true">SA</span>
              <span className="college-footer__name" id="college-footer-title">
                {settings?.institutionName || 'Sri Aurobindo College of Education'}
              </span>
            </Link>
            <p className="college-footer__tagline">Inspiring Minds. Nurturing Educators. Shaping the Future.</p>
            <p className="college-footer__description">
              Committed to quality teacher education, academic excellence and professional development,
              guided by the values and ideals of Sri Aurobindo.
            </p>
            <Link to="/about" className="college-footer__cta">
              Explore Our College <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </section>

          <figure className="college-footer__photo">
            <img
              src="/images/college-classroom.jpg"
              alt="Students and educators gathered at Sri Aurobindo College of Education"
              width="1200"
              height="675"
              loading="lazy"
            />
            <figcaption>Learning, growing, and shaping tomorrow</figcaption>
          </figure>

          <div className="college-footer__details">
            <nav className="college-footer__links" aria-label="Footer quick links">
              <h2>Quick Links</h2>
              <ul>
                {[
                  ['Home', '/'],
                  ['About Us', '/about'],
                  ['Courses', '/courses'],
                  ['Achievements', '/achievements'],
                  ['Facilities', '/facilities'],
                  ['Contact Us', '/contact'],
                ].map(([label, to]) => (
                  <li key={to}><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </nav>

            <section className="college-footer__contact" aria-labelledby="college-footer-contact">
              <h2 id="college-footer-contact">Contact</h2>
              {settings?.address && (
                <p><MapPin size={16} aria-hidden="true" /><span>{settings.address}</span></p>
              )}
              {settings?.contactDetails?.phone && (
                <p><Phone size={16} aria-hidden="true" /><a href={`tel:${settings.contactDetails.phone}`}>{settings.contactDetails.phone}</a></p>
              )}
              {settings?.contactDetails?.email && (
                <p><Mail size={16} aria-hidden="true" /><a href={`mailto:${settings.contactDetails.email}`}>{settings.contactDetails.email}</a></p>
              )}
              <Link to="/contact" className="college-footer__contact-link">Get in touch <ArrowRight size={14} aria-hidden="true" /></Link>
            </section>
          </div>
        </div>

        <div className="section-shell college-footer__bottom">
          <p>© {new Date().getFullYear()} Sri Aurobindo College of Education</p>
          <div>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
