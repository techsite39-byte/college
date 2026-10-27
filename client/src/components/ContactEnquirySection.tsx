import { motion, useReducedMotion } from 'framer-motion';
import { AtSign, MapPin, Phone } from 'lucide-react';
import EnquiryForm from './EnquiryForm';
import '../styles/contact-enquiry.css';

function TelephoneIllustration() {
  return (
    <svg
      className="contact-enquiry__telephone"
      viewBox="0 0 500 440"
      role="img"
      aria-labelledby="contact-telephone-title"
    >
      <title id="contact-telephone-title">Red telephone receiver illustration</title>
      <defs>
        <linearGradient id="telephone-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7464" />
          <stop offset="0.48" stopColor="#ef3f3a" />
          <stop offset="1" stopColor="#b91f28" />
        </linearGradient>
        <linearGradient id="telephone-highlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#601019" stopOpacity="0.32" />
        </linearGradient>
        <filter id="telephone-shadow" x="-35%" y="-35%" width="170%" height="180%">
          <feDropShadow dx="5" dy="17" stdDeviation="13" floodColor="#7b211f" floodOpacity="0.25" />
        </filter>
        <filter id="telephone-soft-shadow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <ellipse cx="237" cy="359" rx="154" ry="22" fill="#8f2930" opacity="0.15" filter="url(#telephone-soft-shadow)" />
      <g filter="url(#telephone-shadow)" transform="rotate(-12 235 206)">
        <path
          d="M164 92C150 72 157 46 178 36L196 28C214 20 236 26 246 42L265 73C274 88 270 108 256 120L232 139C248 178 280 211 319 229L339 204C351 189 371 184 388 193L419 210C436 219 443 240 434 257L425 276C415 297 391 307 368 300C258 265 170 184 139 112C135 104 143 98 164 92Z"
          fill="url(#telephone-red)"
        />
        <path
          d="M164 92C150 72 157 46 178 36L196 28C214 20 236 26 246 42L265 73C274 88 270 108 256 120L232 139C248 178 280 211 319 229L339 204C351 189 371 184 388 193L419 210C436 219 443 240 434 257L425 276C415 297 391 307 368 300C258 265 170 184 139 112C135 104 143 98 164 92Z"
          fill="url(#telephone-highlight)"
        />
        <path d="M169 92L191 78M351 243L366 222" fill="none" stroke="#7e1720" strokeWidth="7" strokeLinecap="round" opacity="0.45" />
        <path d="M174 52C188 42 208 42 220 54L237 78C243 87 241 98 232 105L213 120C198 105 186 89 176 72C172 66 171 59 174 52Z" fill="#a81522" opacity="0.65" />
        <path d="M352 218L367 200C375 191 387 190 397 196L422 210C431 215 435 227 431 237C405 237 379 231 352 218Z" fill="#a81522" opacity="0.65" />
        <path d="M169 56C182 42 203 42 217 54M365 211C375 197 390 195 403 204" fill="none" stroke="#ffb0a0" strokeWidth="5" strokeLinecap="round" opacity="0.72" />
        <circle cx="198" cy="91" r="15" fill="#d82c34" stroke="#ff9585" strokeWidth="3" />
        <circle cx="388" cy="231" r="15" fill="#d82c34" stroke="#ff9585" strokeWidth="3" />
        <circle cx="198" cy="91" r="6" fill="#8f1721" />
        <circle cx="388" cy="231" r="6" fill="#8f1721" />
      </g>
      <path
        className="contact-enquiry__cord"
        d="M414 287C460 307 466 328 433 339C400 350 399 364 434 371C469 378 471 393 435 400C398 407 403 421 446 423"
        fill="none"
        stroke="#c72c32"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M414 287C460 307 466 328 433 339C400 350 399 364 434 371C469 378 471 393 435 400C398 407 403 421 446 423"
        fill="none"
        stroke="#ffb0a0"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="447" cy="423" r="7" fill="#f2b544" />
    </svg>
  );
}

export default function ContactEnquirySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="contact-enquiry" aria-labelledby="contact-enquiry-title">
      <motion.div
        className="contact-enquiry__panel"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="contact-enquiry__visual">
          <div className="contact-enquiry__illustration-wrap">
            <span className="contact-enquiry__halo" aria-hidden="true" />
            <TelephoneIllustration />
          </div>
          <div className="contact-enquiry__college">
            <p className="contact-enquiry__eyebrow">Sri Aurobindo College of Education</p>
            <h2>(D.Ed and B.Ed)</h2>
            <address>
              <p>
                <MapPin size={17} aria-hidden="true" />
                <span>Nalgonda, Telangana – 508006</span>
              </p>
              <a href="tel:+919948419971">
                <Phone size={17} aria-hidden="true" />
                <span>+91 99484 19971</span>
              </a>
              <a href="mailto:thatis1969@gmail.com">
                <AtSign size={17} aria-hidden="true" />
                <span>thatis1969@gmail.com</span>
              </a>
            </address>
            <a
              className="contact-enquiry__map"
              href="https://www.google.com/maps/search/?api=1&query=Sri+Aurobindo+College+of+Education%2C+Nalgonda%2C+Telangana+508006"
              target="_blank"
              rel="noreferrer"
            >
              View college location <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="contact-enquiry__form">
          <p className="contact-enquiry__eyebrow">We’re here to help</p>
          <h2 id="contact-enquiry-title">Need Support?</h2>
          <p className="contact-enquiry__subtitle">
            Students, parents, and visitors are welcome to get in touch with the college.
          </p>
          <EnquiryForm contactLayout />
        </div>
      </motion.div>
    </section>
  );
}
