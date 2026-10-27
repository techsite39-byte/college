# Website Design Audit Report

**Audit date:** 25 October 2026  
**Project root:** `D:\college`  
**Mode:** Read-only. No source, dependency, environment, database, or existing build files were changed. The only new file is this requested report.

## Evidence labels

- **VERIFIED** — directly observed in source, a command result, or browser output during this audit.
- **CODE-BASED RISK** — supported by implementation/configuration, but impact depends on production data, devices, or deployment.
- **NEEDS MANUAL TESTING** — could not be safely or reliably verified in this audit.

## 1. Executive summary

The inspected source is a React 18 + TypeScript single-page college website, styled with Tailwind CSS and backed by an Express/MongoDB API. Its visual direction is consistent and restrained: navy, warm ivory, and muted gold; serif display headings; responsive card and editorial layouts; and a clear home-page admissions pathway. The home page and key routes rendered in the local Vite browser. At the five requested viewport widths, the home page had no horizontal overflow. The public route smoke check rendered all 22 tested route patterns; content-detail pages could not show records because the local API returned errors.

The most consequential findings are:

1. **The public domain does not appear to serve the audited React experience.** The live `https://www.sriaurobindocoe.org.in/` page showed a different, older-looking navigation and page structure (for example, `.html` destinations) than the local React routes. The repository sets that same domain as its canonical and image host. Confirm the intended deployment before relying on this source audit as a production-site audit.
2. **The server TypeScript check fails.** A no-emit server check reported eight errors in the upload and admin routes. The root `build` script runs that server TypeScript build after the client build, so a production build is at risk of failing.
3. **Gold text on light backgrounds has insufficient measured contrast.** The design tokens yield 2.17:1 for `#C5A46D` on `#F8F5EF`, and the eyebrow shade yields 3.75:1 on that background—both below 4.5:1 for normal text.
4. **Reduced-motion support is incomplete for JavaScript animations and explicit smooth scrolling.** The global CSS preference does not suppress Framer Motion animations, and some animated components do not consult the reduced-motion preference.
5. **Some runtime observations are environment-limited.** The existing local Vite server was reachable, but its API proxy returned HTTP 500 errors during the browser check. No enquiry, login, admin mutation, or other external action was submitted.

There are no source-only Critical findings in this audit. Client lint and client type-check passed. No tests are configured in the inspected package scripts. The full build was not run because it writes build outputs; the safe server no-emit check already surfaced build-blocking TypeScript errors.

## 2. Project architecture and technology stack

### Framework and rendering

- **Client:** React 18, TypeScript, Vite 5, React Router 7.
- **Rendering:** Client-side SPA mounted with `ReactDOM.createRoot` and `BrowserRouter` in `client/src/main.tsx`. Pages are statically imported in `client/src/App.tsx`; there is no server-side rendering or route-level lazy import in the inspected source.
- **Data fetching:** TanStack React Query, shared `apiRequest`/`apiUpload` helpers in `client/src/lib/api.ts`.
- **Forms:** React Hook Form, Zod, and `@hookform/resolvers`.
- **Styles:** Tailwind CSS 3, PostCSS, and a small global stylesheet in `client/src/styles/index.css`.
- **Animation:** Framer Motion 11. No GSAP, ScrollTrigger, Lenis, Three.js/React Three Fiber, canvas animation, video sequence, or local 3D-model pipeline was found.
- **Server:** Express 4, TypeScript, Mongoose/MongoDB, JWT, bcryptjs, Helmet, CORS, rate limiting, Nodemailer, Multer, and optional Cloudinary uploads.
- **Build/test tooling:** Vite and TypeScript builds; ESLint client lint. No `test` script or test files were found in the inspected package scripts/source inventory.

### Structure and shared UI

- `client/src/App.tsx`: application routes, route-level metadata updates, and the route wrapper.
- `client/src/components/Layout.tsx`: reusable public header, desktop/mobile navigation, announcement banner, and footer.
- `client/src/components/EnquiryForm.tsx`: shared enquiry form reused on home, admissions, and contact pages.
- `client/src/pages/`: page components, including the admin dashboard.
- `client/src/data/siteContent.ts`: fixed campus-photo URL constants and the course-name list.
- `client/public/robots.txt` and `client/public/sitemap.xml`: crawler policy and static route sitemap.
- `server/src/`: Express server, routes, controllers, models, middleware, and configuration.
- The client asset inventory contains no local photographs, video, font files, or 3D assets. Fixed photos are remote URLs under `https://www.sriaurobindocoe.org.in/images/`; gallery and CMS images are runtime data. No definite duplicated page component or broken local media reference was identified.

## 3. Pages and sections inspected

The route table in `client/src/App.tsx` contains the following:

| Route | Page/sections inspected |
|---|---|
| `/` | Hero, institution introduction, programme cards, campus/features, principal message, gallery preview, optional notices/events/achievements, enquiry CTA, shared footer |
| `/about` | Institutional history and campus image |
| `/about/history` | Institutional history text and image |
| `/about/principal` | Principal message text and image |
| `/academics` | Institutional commitment, recognition, and programme-information panel |
| `/courses` | Course list, loading/error/empty states, course cards |
| `/courses/:slug` | Course detail template |
| `/admissions` | Programme links, admissions guidance, enquiry form |
| `/admissions/eligibility` | Eligibility information |
| `/admissions/how-to-apply` | Application guidance |
| `/campus` | Three facility/resource cards and campus images |
| `/facilities` | Facility information page |
| `/gallery` | Category filters, image grid, keyboard-operated lightbox |
| `/achievements` | Achievement list and attachments |
| `/events` | Event list and pagination |
| `/events/:slug` | Event detail template |
| `/notices` | Search, notice list, attachments, pagination |
| `/notices/:slug` | Notice detail template |
| `/contact` | Configured contact details and enquiry form |
| `/privacy-policy` | Privacy information |
| `/terms` | Terms of use |
| `/admin/*` | Admin login, dashboard, content management, uploads, and enquiry management |
| `*` | Not-found page |

The public pages generally share the same header/footer and section-width conventions. The not-found page has its own full-screen layout; the admin has a separate dashboard layout. The admin UI and data-changing operations were inspected in source but not exercised.

## 4. Current design system and visual identity

- **Palette (verified in `client/tailwind.config.js`):** navy `#101B2D`, ivory `#F8F5EF`, gold `#C5A46D`, slate `#64748B`, and green `#1D4D3E`; plus darker navy variants in component classes.
- **Typography:** Georgia/Times-style serif for display headings and a system sans stack for body text. The stack requests Inter, but no local or remote font loading declaration was found, so Inter availability is environment-dependent and the fallback is expected.
- **Visual language:** large serif headlines, uppercase tracked eyebrow labels, thin gold rules/underlines, neutral cards, restrained borders/shadows, and alternating ivory/white/navy sections.
- **Responsive layout:** Tailwind breakpoints, fluid section shell, grid-to-column changes, and a mobile navigation toggle. Source and browser evidence show the requested home page layouts do not introduce horizontal overflow.
- **Image treatment:** fixed-height image frames use `object-cover`; the home hero uses a dark gradient over a remote campus image. The gallery uses cropped cards and a contained lightbox image.
- **Strengths:** clear page titles and section headings, repeatable spacing/card patterns, obvious admissions CTAs, visible focus styles for common controls, and explicit loading/error/empty messages on data-backed lists.
- **Unfinished/uneven areas:** gold is used for small text on light surfaces despite low contrast; the local brand mark is text initials rather than a supplied image logo; the local source has no design tokens for component spacing/typography beyond Tailwind classes; content detail views require populated API data to assess fully. These are design observations, not proof of missing production content.

### Measured contrast

Ratios below were calculated from the declared colors using the WCAG relative-luminance formula:

| Foreground | Background | Ratio | Assessment for normal text |
|---|---|---:|---|
| `#101B2D` | `#F8F5EF` | 15.86:1 | Pass |
| `#C5A46D` | `#F8F5EF` | 2.17:1 | Fail |
| `#9A7845` (eyebrow CSS) | `#F8F5EF` | 3.75:1 | Fail |
| `#64748B` | `#FFFFFF` | 4.76:1 | Pass |

These ratios apply to those exact color pairs. Text over photography, gradients, opacity blends, or dynamic CMS colors needs separate measurement.

## 5. Section-by-section design findings

### Home page

- **Hero:** full-bleed image, gradient overlay, location/discipline eyebrow, large two-line headline, two CTAs, and scroll cue. Strong hierarchy and good attention direction. At small widths the minimum section height is still 690px (`HomePage.tsx`), so the first fold is intentionally immersive rather than compact.
- **Institution introduction:** two-column text/image layout at large widths, stacked on smaller screens; caption overlaps the image frame. Clear editorial presentation.
- **Programme cards:** navy section with course content from API or two fallback course labels. When API content is unavailable, a status message is shown; the fallback is graceful.
- **Campus, principal, and gallery areas:** consistent image grid/card treatment and clear links. Cards use intentional image crops; verify focal points on the source images and narrow screens.
- **Updates and enquiry:** updates render only if at least one collection has records. The final CTA contains the shared form. No form was submitted.

### About, academics, admissions, campus, facilities, history, principal

- Informational pages use a consistent eyebrow/title/body hierarchy and generous vertical spacing. About combines text and a campus photo; campus uses three image cards. Admissions clearly warns that current eligibility and availability require confirmation and presents the form beside programme links.
- `InstitutionInfoPage.tsx` powers several distinct routes. This reduces duplicated layout, although one generic image alt string is reused wherever that page displays an image.
- **Needs content verification:** the source text includes institutional history, recognition, facilities, and admissions claims. This audit did not independently validate those facts with the college.

### Courses, events, notices, achievements, and detail views

- List pages expose loading, error, and empty states; events/notices have pagination and notices include a debounced search.
- Content cards have restrained borders and readable spacing; event rows switch to a two-column layout at medium widths.
- Dynamic imagery generally has fixed dimensions and lazy loading on list cards. Some dynamic images have empty alt attributes; see accessibility findings.
- Detail pages render only after API data is available. At audit time the local API was unavailable, so detail-page content and populated list layouts were not visually verified.

### Gallery

- Category chips, responsive grid, descriptive button labels, and a dark modal with close/previous/next controls provide useful interaction affordances.
- The lightbox handles Escape and arrow keys and returns focus to the trigger on close. Its Tab handling currently forces focus back to the close button for every Tab key, making the previous/next controls unreachable by Tab; see prioritized findings.

### Contact and shared shell

- Contact has address/phone/email/website fields conditional on site settings and a shared enquiry form. Phone and email are correctly rendered as `tel:`/`mailto:` links.
- The shared header has a sticky translucent surface, an active desktop navigation state, an admissions CTA, and a mobile menu. Footer links cover common destination pages and legal routes.
- `NotFoundPage.tsx` uses a self-contained centered 404 card rather than the shared site shell, so it does not include the usual navigation/footer.

## 6. Animation and scroll behavior findings

- **Framer Motion usage found:** route wrapper opacity animation in `App.tsx`; home hero image vertical parallax via `useScroll`/`useTransform`; home hero text entrance; one-time `whileInView` reveals; mobile menu enter/exit; gallery lightbox fade.
- **Timing/configuration evidence:** hero entrance durations range from 0.6–0.75s; reveal duration is 0.55s and triggers once at 20% viewport visibility; mobile navigation transition is 0.2s. The home image maps scroll positions 0–700 to a 0–90px vertical translation.
- **CSS motion:** global smooth scrolling and component hover transforms/transitions. No GSAP timelines, ScrollTrigger pins/scrubbing, Lenis, WebGL, canvas, or frame-sequence implementation found.
- **Good safeguards:** motion-reduction hook is used in `App.tsx` and `HomePage.tsx`; global CSS responds to `prefers-reduced-motion`. Scroll listeners in `Layout.tsx` and key listeners in layout/gallery have cleanup.
- **Risks:** the mobile menu and gallery modal use Framer Motion without `useReducedMotion`; CSS media rules do not disable Framer Motion’s JavaScript-controlled values. The shared route effect explicitly calls `scrollTo({behavior: 'smooth'})`, which is not overridden by the CSS preference. Route wrapper has no pathname key or exit presence wrapper, so it is not a distinct enter/exit transition per route.
- **No reproducible animation breakage was established.** No fast-scroll/resize stress test or performance trace was run.

## 7. Responsive design findings

### Browser-verified local home-page matrix

The local Vite app at `http://localhost:5173/` was checked at the requested viewports. The horizontal-overflow measurement compared document `scrollWidth` with `clientWidth` (not `innerWidth`, which includes the scrollbar).

| Viewport | Horizontal overflow | Result |
|---|---|---|
| 390 × 844 | No | Pass for home-page width |
| 768 × 1024 | No | Pass for home-page width |
| 1366 × 768 | No | Pass for home-page width |
| 1440 × 900 | No | Pass for home-page width |
| 1920 × 1080 | No | Pass for home-page width |

The 22 route patterns listed above were smoke-visited in the local browser. All produced the application shell without horizontal overflow at the tested desktop width; the dynamic course/event/notice detail routes had no content heading because their API data was unavailable.

The mobile menu opened and set `aria-expanded="true"`; Escape set it back to `"false"`. The navigation remains mounted briefly for its configured exit animation, which is expected.

**Limits:** only the home page was measured at all five viewport sizes. Other routes, landscape orientation, zoom, keyboard-only navigation, iOS/Android browser behavior, and content-heavy CMS records still need manual testing. The public production domain is a different apparent experience from this local app, so its viewport evidence must not be substituted for local source verification.

## 8. Performance bottlenecks and evidence

- **Remote media dependency — CODE-BASED RISK:** eight fixed campus image URLs are built from `https://www.sriaurobindocoe.org.in/images` in `client/src/data/siteContent.ts`. The client has no locally bundled media or `srcset` variants. Availability, latency, caching headers, image byte sizes, and rights were not audited. A remote host issue can affect hero and content imagery.
- **Image loading:** the home hero sets `fetchPriority="high"` and explicit dimensions; most below-fold cards use `loading="lazy"` and width/height attributes. Some dynamic detail/lightbox images do not have loading or intrinsic dimensions. At browser start, lazy images outside the viewport were not treated as broken merely because they had not loaded yet.
- **Runtime warning — VERIFIED:** local browser console reported React does not recognize the `fetchPriority` prop in the current React runtime at `HomePage.tsx:47`. This may mean the intended high-priority hint is not applied as intended. Confirm React 18 support and emitted markup.
- **Bundle risk — CODE-BASED RISK:** all route components, including the admin page, are statically imported. An existing `client/dist` artifact contains a single JavaScript asset of 521,218 bytes (~509 KiB) and CSS of 25,515 bytes (~24.9 KiB). These artifacts are dated 24 October and were not rebuilt; the values are uncompressed file sizes and are not reliable current-source or transfer-size measurements. No route-level code splitting or gzip/Brotli measurement was performed.
- **Re-renders:** React Query defaults are set to one retry and avoid refetch-on-window-focus. The home page subscribes to four independent collections; `PageLayout` also fetches shared site settings. These calls are modest in count but all currently fail in this local environment.
- **No evidence found** of permanently broad `will-change`, animating layout properties, or a local WebGL/3D rendering workload.
- **No Lighthouse, Web Vitals, network waterfall, memory profile, or low-spec-device benchmark** was run.

## 9. Accessibility and SEO findings

### Accessibility

- **Positive:** semantic `main`, `header`, `nav`, `footer`, article elements, a page-level `h1` pattern, real buttons/links for interactions, explicit labels on form inputs, live status messages, error roles, visible `:focus-visible` outlines, and a `prefers-reduced-motion` CSS rule are present.
- **Contrast — VERIFIED:** gold/eyebrow pairs on ivory fail normal-text contrast thresholds (see measurements above). Use a darker text color for small copy and preserve gold for larger text/decoration where contrast is sufficient.
- **Missing skip link — CODE-BASED RISK:** no skip-to-main link was found in the shared layout. Keyboard users must traverse the navigation on each page.
- **Gallery keyboard focus — VERIFIED in code:** while the modal is open, every Tab press is prevented and focus is sent to the close button. This prevents Tab access to previous/next controls.
- **Dynamic image descriptions — CODE-BASED RISK:** course and event card images and some achievement images use `alt=""`; if those images communicate content not repeated in adjacent text, screen-reader users lose that information. CMS gallery images have an alt-text fallback to title.
- **Form errors — CODE-BASED RISK:** inputs are labelled by wrapping labels, but field error text is not associated with inputs through `aria-describedby`/`aria-invalid`. Screen-reader announcement of validation errors should be checked.
- **Reduced motion:** see animation section; JS-controlled motion and explicit smooth scrolling remain active in some areas despite the global CSS preference.
- **Needs manual testing:** full keyboard traversal, focus order/return, screen readers, touch targets, zoom/reflow, and mobile assistive technology.

### SEO

- Static `index.html` includes a description, robots directive, canonical URL, Open Graph title/description/image, and EducationalOrganization JSON-LD. `App.tsx` updates title, description, Open Graph title/description, robots, and canonical path after client navigation; admin paths are marked `noindex, nofollow`.
- **Home title duplication — VERIFIED:** local browser title was `Sri Aurobindo College of Education | Sri Aurobindo College of Education`. The root title metadata already contains the organization name and then appends the organization suffix again.
- **SPA/social-preview risk — CODE-BASED RISK:** metadata is changed in a client `useEffect`, with one generic initial HTML document. Crawlers/social preview systems that do not execute the app may see generic metadata. No `og:url`, Twitter card metadata, or per-route server-rendered metadata was found.
- Sitemap lists 18 static public routes but no dynamic course/event/notice detail URLs. A CMS-aware sitemap strategy is needed if those pages should be discoverable.
- Robots excludes `/admin/` and references the expected sitemap.
- **Live host discrepancy — VERIFIED browser observation:** the public domain rendered a different page/navigation from the local React project. This prevents confirming that this source’s metadata and route behavior are what visitors currently receive.

## 10. Functional and technical issues

- **Local API errors — VERIFIED in current environment:** the client page loaded, but five API requests in the browser log returned HTTP 500 through Vite’s `/api` proxy. Only port 5173 was listening in the port check; the configured API target is `localhost:5001`. The home fallback and error state rendered. This is an environment limitation, not proof that the production API is failing.
- **Forms and actions:** the enquiry form performs client-side Zod validation, shows success/failure status, and resets on success. It was not submitted. Admin login, delete, save, uploads, and enquiry updates were not exercised.
- **Links/navigation:** source route table and public links use matching React Router routes for inspected static pages; route smoke check rendered the shell. External links, CMS-provided attachments, and actual destinations were not exhaustively followed.
- **Server type-check — VERIFIED failure:** `tsc -p server/tsconfig.json --noEmit` reports eight errors: one `Buffer`/`BlobPart` incompatibility at `server/src/controllers/uploadController.ts:32`; tuple/index and middleware typing errors around `server/src/routes/adminRoutes.ts:21-45`. Because `server/package.json` build runs `tsc -p tsconfig.json`, and root build runs the server build after client build, the production build is at risk of failing. No fix was applied.
- **Client checks:** `npm.cmd run lint` passed. Client `tsc -p client/tsconfig.app.json --noEmit` passed. The full build was skipped to avoid writing/replacing generated output. No test script was present.
- **Static design audit script:** scanned 58 files. It reported clean checks for hover transitions, animating layout properties, focus-outline removal, clickable non-button elements, broad `will-change`, and presence of reduced-motion references. Its conditional-render findings are largely ordinary conditional UI; its `setTimeout` finding is the notice-search debounce, not an animation loop. Eight decorative-motion candidates were heuristically flagged; these require element-by-element context and were not treated as confirmed accessibility failures.
- **Production verification:** no database, deployed API, real email, Cloudinary upload, or external form action was tested.

## 11. Screenshots and test evidence

- Integrated browser screenshots were viewed for the local React homepage and the public domain homepage. No screenshot file was created, in keeping with read-only constraints.
- Local viewport metrics: no horizontal overflow at 390×844, 768×1024, 1366×768, 1440×900, or 1920×1080.
- Local route smoke test: 22 routes/patterns returned the app shell; data detail routes could not be checked with real content.
- Local browser console: React `fetchPriority` warning and API-proxy HTTP 500 errors.
- Lint: passed. Client no-emit type-check: passed. Server no-emit type-check: failed with eight TypeScript diagnostics.
- Live-domain browser snapshot: page title “Sri Aurobindo College of Education | Home” and legacy `.html` navigation, unlike the audited app route structure. This is evidence of a deployment/source mismatch, not a claim that the local project has the same visual defects.

## 12. Prioritized issue list

### Critical

No Critical source issue was verified.

### High

1. **Public-domain/source mismatch — VERIFIED**  
   **Page/component:** whole public site / deployment  
   **File/evidence:** `client/index.html:11-14` points canonical and social image to the public domain; `client/src/App.tsx:43-65` defines the React route structure. Browser inspection of `https://www.sriaurobindocoe.org.in/` showed a different legacy navigation (`index.html`, `about.html`, etc.) and page composition.  
   **Impact:** this source audit may not describe what visitors see; releases, SEO checks, and design QA can target the wrong application.  
   **Recommended fix:** verify hosting/build target, SPA rewrite configuration, deployment version, and canonical domain; repeat visual testing against the confirmed deployment.  
   **Priority rationale:** release and audit integrity.

2. **Server type-check failure — VERIFIED**  
   **Page/component:** Express upload/admin routes  
   **File/evidence:** `server/src/controllers/uploadController.ts:32`; `server/src/routes/adminRoutes.ts:21-45`. The safe no-emit server type-check returned eight diagnostics.  
   **Impact:** the configured production build may fail before a deployable server artifact is produced.  
   **Recommended fix:** resolve the type errors, then run the existing root build in a controlled environment and verify server/client artifacts.  
   **Priority rationale:** build/release blocker.

### Medium

3. **Insufficient gold text contrast — VERIFIED**  
   **Page/component:** eyebrow labels and gold copy over ivory/light surfaces  
   **File/evidence:** `client/tailwind.config.js:8-18`; `client/src/styles/index.css:63-67`. Measured 2.17:1 (`#C5A46D` on ivory) and 3.75:1 (`#9A7845` on ivory), below 4.5:1 for normal text.  
   **Impact:** low-vision users may have difficulty reading labels and small gold copy.  
   **Recommended fix:** use a darker accessible text token on light backgrounds; reserve lighter gold for decorative rules or suitably large text.

4. **Reduced-motion coverage is incomplete — CODE-BASED RISK**  
   **Page/component:** global route transitions, mobile menu, gallery modal, route scrolling  
   **File/evidence:** CSS preference in `client/src/styles/index.css:22-33`; unguarded Framer Motion in `client/src/components/Layout.tsx:128-148` and `client/src/pages/GalleryPage.tsx:68-87`; unconditional smooth scroll in `client/src/components/Layout.tsx:35-40`.  
   **Impact:** motion-sensitive users may still receive scripted transitions and smooth scrolling.  
   **Recommended fix:** apply reduced-motion-aware behavior to every JS animation and route scroll, and verify with OS/browser preference enabled.

5. **Gallery modal traps Tab on the close button — VERIFIED in code**  
   **Page/component:** gallery lightbox  
   **File/evidence:** `client/src/pages/GalleryPage.tsx:30-45`. Every Tab is prevented and focus is moved to the close button while previous/next buttons are also present.  
   **Impact:** keyboard-only users cannot reach the lightbox navigation buttons through normal Tab order.  
   **Recommended fix:** implement a complete focus trap cycling through all modal controls, or use a tested accessible dialog pattern.

6. **Content-image alternatives are inconsistent — CODE-BASED RISK**  
   **Page/component:** home course cards, course/event/achievement cards  
   **File/evidence:** `client/src/pages/HomePage.tsx:119`, `client/src/pages/CoursesPage.tsx:44`, `client/src/pages/EventsPage.tsx:37`, `client/src/pages/AchievementsPage.tsx:24` use empty alt text for CMS images.  
   **Impact:** meaningful photo information may be unavailable to screen-reader users.  
   **Recommended fix:** provide meaningful CMS alt text where an image conveys content; keep empty alt only for genuinely decorative images.

7. **No skip-to-content link — CODE-BASED RISK**  
   **Page/component:** shared public shell  
   **File/evidence:** `client/src/components/Layout.tsx:87-151`; no skip link is rendered before navigation.  
   **Impact:** keyboard users must traverse repeated navigation on every route.  
   **Recommended fix:** add a visible-on-focus skip link targeting each page’s `main` landmark.

8. **Client-side-only metadata and incomplete dynamic sitemap — CODE-BASED RISK**  
   **Page/component:** public route SEO  
   **File/evidence:** `client/src/App.tsx:29-37`, `client/index.html:5-18`, `client/public/sitemap.xml`. Metadata is updated in an effect; the sitemap omits CMS detail routes.  
   **Impact:** crawlers and social preview systems may see generic metadata or miss dynamic content URLs.  
   **Recommended fix:** provide crawlable per-route metadata/pre-rendering where required and generate sitemap entries from published content.

### Low

9. **Duplicate organization name in home document title — VERIFIED**  
   **Page/component:** home page metadata  
   **File/evidence:** `client/src/App.tsx:72-73`; local browser title duplicated the organization name on both sides of the separator.  
   **Impact:** redundant browser/search title presentation.  
   **Recommended fix:** use a shorter home title or avoid appending the suffix when it is already present.

10. **React warning for image priority prop — VERIFIED**  
    **Page/component:** home hero image  
    **File/evidence:** `client/src/pages/HomePage.tsx:42-48`; browser console warns that React does not recognize `fetchPriority`.  
    **Impact:** noisy console and uncertain application of the intended high-priority hint in this React runtime.  
    **Recommended fix:** use the attribute spelling supported by the installed React version or upgrade only through a separately planned dependency change; verify the rendered DOM and network priority.

11. **Fixed external image host and no responsive source variants — CODE-BASED RISK**  
    **Page/component:** home/about/campus/principal photos  
    **File/evidence:** `client/src/data/siteContent.ts:1-12`.  
    **Impact:** image delivery depends on another host, and oversized source files may be transferred to mobile clients. Exact bytes and response/cache headers were not measured.  
    **Recommended fix:** confirm image permissions, responsive variants, format/quality, cache policy, and fallback behavior.

12. **Local API unavailable during browser audit — NEEDS MANUAL TESTING**  
    **Page/component:** data-backed pages and site settings  
    **File/evidence:** Vite proxy in `client/vite.config.ts` targets `localhost:5001`; browser reported five HTTP 500 responses.  
    **Impact:** populated course/events/notices/gallery/contact/admin states could not be verified locally.  
    **Recommended fix:** repeat read-only UI testing with the intended API and a non-sensitive test database/content fixture; do not submit or mutate production data.

## 13. Recommended improvements ranked by impact

1. Confirm whether the React app is intended to replace the currently served public-domain experience; verify the deployment target and canonical domain.
2. Resolve the eight server TypeScript diagnostics and confirm a complete build in a safe, isolated build output location.
3. Fix low-contrast gold text on light surfaces and re-check every text/background pairing, including overlays and dynamic content.
4. Complete reduced-motion handling across route scrolling, mobile navigation, and gallery lightbox.
5. Correct the gallery modal keyboard focus model; add skip navigation and associate form validation errors with their fields.
6. Review CMS image alt-text requirements and provide a meaningful image fallback strategy.
7. Improve SEO for SPA routes and ensure published dynamic detail pages can be discovered and previewed.
8. Verify image delivery size, responsiveness, caching, and rights; evaluate route-level code splitting for public/admin code.
9. Correct the duplicate home title and validate the React 18 image-priority attribute.

## 14. Safe implementation roadmap

### Phase 1 — Release and baseline verification

- Confirm domain-to-build mapping, hosting rewrites, and canonical URL.
- Fix server type errors and run client/server builds in an isolated output location.
- Run the app with the intended API and safe, non-production content; record browser console/network results.

### Phase 2 — Accessibility essentials

- Adjust light-surface text colors to meet WCAG contrast requirements.
- Complete reduced-motion behavior and honor it for scripted scroll.
- Correct the gallery modal focus cycle; add skip-to-main navigation.
- Connect validation messages to inputs and audit dynamic image alt text.

### Phase 3 — Performance and content delivery

- Measure actual image transfer sizes and caching; use appropriately sized responsive formats.
- Assess route splitting, especially the admin bundle, against real build output and mobile throttling.
- Run Web Vitals/Lighthouse and a scroll/animation trace against the confirmed deployment.

### Phase 4 — SEO and final QA

- Ensure per-route metadata is visible to target search and social-preview crawlers.
- Add published CMS content routes to the sitemap where appropriate.
- Perform cross-device, keyboard, screen-reader, reduced-motion, and populated-data regression testing.

No implementation steps were performed during this audit.

## 15. Items requiring manual browser or device testing

- Confirm the public site deployment and repeat testing on the exact production build.
- Inspect all routes at all five viewport sizes with populated API records, especially gallery, long titles, event pagination, notice search, and admin tables.
- Test touch targets, mobile menu focus order, keyboard-only navigation, 200% zoom/reflow, and screen-reader output.
- Test `prefers-reduced-motion` enabled, quick scroll, orientation change, and window resize during transitions.
- Submit forms only against a safe test environment; verify server validation, delivery outcome, and error handling. Do not submit real enquiries.
- Verify external image/attachment/map destinations, image rights, broken links, console errors, and network failures.
- Measure Lighthouse/Web Vitals, compressed bundle transfer size, LCP image behavior, CLS, and animation frame timing on a low-end mobile device.
- Verify Cloudinary uploads, admin authentication, database-backed content, and email behavior only with authorized test credentials and non-production services.

## Concise closing summary

The source has a coherent, responsive design and passed client lint/type-check; the local home page showed no horizontal overflow at the five requested viewports. The five highest-priority items are: (1) public-domain/source deployment mismatch, (2) server build blocked by TypeScript errors, (3) low-contrast gold text, (4) incomplete reduced-motion support, and (5) the gallery modal’s keyboard focus behavior. The safest next step is to confirm the correct deployment target and resolve the server type-check before any design implementation.
