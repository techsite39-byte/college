# Premium Design & Page Repair Plan

**Project:** Sri Aurobindo College of Education website  
**Project root:** `D:\college`  
**Audit date:** 25 October 2026  
**Mode:** Read-only audit and planning. No application code, configuration, packages, environment values, database records, or deployment settings were changed.

## Evidence labels and scope

- **VERIFIED** — observed directly in source or reproduced in the local browser during this audit.
- **CODE-BASED RISK** — supported by source/configuration, but requires the intended API, published data, device, or deployment to confirm user impact.
- **NEEDS MANUAL TESTING** — unavailable or unsafe to validate in this session.

This audit covers the local React/Vite app at `http://localhost:5173/`. Previous audit evidence also compares that app to the public domain. The production domain is visibly different, and this workspace has no Git or Vercel project metadata; therefore, findings about the local app must not be assumed to describe the deployed production app.

## 1. Executive summary

### Broken-page result

No tested local route rendered a blank page or crashed. Direct navigation to the route paths returned HTTP 200 from Vite and rendered either the intended page, the admin sign-in view, the not-found view, or a visible API error state.

The reproducible local failure is in the **data/API layer**, not React route matching: the Vite proxy targets `localhost:5001`, but no listener on port 5001 was found and a read-only `/api/health` probe timed out. The browser consequently received HTTP 500 responses on API-backed pages. Course, event, notice, gallery, achievement, and detail pages displayed error states. The home page displayed its course-load warning but did not surface all failed optional event/notice/achievement queries; contact retained its enquiry form and fallback contact text. The backend/API must be available before those data-dependent page states can be fully verified.

The app uses React Router `BrowserRouter` with a route table in `client/src/App.tsx`. Local direct-route loads worked, including nested routes and unknown-route fallback. This verifies Vite development-server fallback behavior only; it does not verify a separately deployed static host’s rewrite rules.

### Main design direction

Keep the current institutional palette and editorial foundation, but refine contrast, typography scale, spacing, image treatment, shared components, and mobile navigation. Use the existing Framer Motion dependency for restrained motion; do not add another animation framework or introduce WebGL/3D. Prioritize accessibility and clear content states over decorative effects.

### Key risks

- **Verified local:** API proxy failures block live content and detail-page validation.
- **Verified from prior compiler run:** eight server TypeScript errors make the configured server build fail; do not treat these as frontend route causes.
- **Verified from previous browser audit:** public-domain content/navigation differs substantially from the local Vite application.
- **Verified from source:** gold text on light surfaces has inadequate contrast; gallery lightbox traps Tab focus on the close control.
- **Not verified:** production deployment routing, real data behavior, browser-console state on production, and authenticated admin content.

## 2. Application and dependency baseline

- Frontend: React 18, TypeScript, Vite 5, React Router 7, Tailwind CSS 3.
- Backend: TypeScript, Express 4, Mongoose/MongoDB, separate from the Vite client.
- Client data/forms: TanStack React Query, React Hook Form, Zod.
- Existing animation library: Framer Motion 11.
- No Next.js configuration or `next` dependency; no GSAP, ScrollTrigger, Lenis, Three.js/React Three Fiber, canvas, video sequence, or 3D asset implementation was found.
- Root scripts: `dev`, `build`, `lint`, `start`. Client scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `lint`. Server scripts: `dev`, `build` (`tsc -p tsconfig.json`), `start`.
- Prior verified checks: client lint and client no-emit type-check pass. The no-emit server type-check fails with eight diagnostics documented in [WEBSITE_DESIGN_AUDIT_REPORT.md](./WEBSITE_DESIGN_AUDIT_REPORT.md). No frontend test script was found.
- The root `build` script runs the client build and then the server build. The server diagnostics are therefore a release/build risk, but they do not explain the local client API outage or a broken React route.

## 3. Route-by-route broken-page audit

**Status key:** **WORKS** means the route rendered during local direct navigation. **API ERROR** means route matching and page shell work, but the required local API request returned HTTP 500 and the error UI appeared. **LIMITED** means public shell/redirect is verified but protected or populated states are not.

| Route | Page component | Status and evidence | Root cause or limitation | Recommended fix |
|---|---|---|---|---|
| `/` | `HomePage` | **WORKS with partial data failure.** Direct load rendered hero, sections, and enquiry form. | Four optional content requests use the unavailable local API. Only course-query failure has a visible warning; event/notice/achievement failure can leave the optional update section absent. | Restore/verify the API first; show clear, non-intrusive errors for failed optional collections while preserving the static content and course fallback. |
| `/about` | `AboutPage` | **WORKS.** Direct load rendered heading, text, links, and image frame. | No API dependency for page body. External photo host is a dependency. | Preserve content; improve editorial layout and image crop/credit treatment. |
| `/about/history` | `InstitutionInfoPage` (`page="history"`) | **WORKS.** Direct load rendered history heading and content. | Shared template; no route error observed. | Preserve verified text and present dated history as a clear timeline/editorial block if approved. |
| `/about/principal` | `InstitutionInfoPage` (`page="principal"`) | **WORKS.** Direct load rendered message content. | Shared template; content is intentionally limited to available approved material. | Preserve attribution caution; use a restrained portrait/message layout only with approved assets. |
| `/academics` | `AcademicsPage` | **WORKS.** Direct load rendered commitment, recognition, and programme-information sections. | No route/API failure observed. | Refine programme information hierarchy; avoid presenting unverified schedules or claims as current. |
| `/courses` | `CoursesPage` | **API ERROR.** After waiting, visible `role="alert"` showed `Request failed (500)`. | GET `public/courses` failed because local API service at port 5001 was unavailable in the audit environment. Page already has loading, error, and empty states. | Verify API service/configuration and endpoint response; then verify populated and empty states. Do not replace a server failure with an empty state. |
| `/courses/:slug` | `ContentDetailPage` (`kind="courses"`) | **API ERROR.** `/courses/sample` showed “This item is unavailable” and a back link. | Detail API request failed with HTTP 500; a real published slug was unavailable for testing. | Verify `public/courses/:slug`, published record/slug, API availability, and actual content rendering. |
| `/admissions` | `AdmissionsPage` + `EnquiryForm` | **WORKS.** Direct load rendered programme links, guidance, and form. No submission performed. | No route failure. Server-side validation and delivery were not exercised. | Preserve form and course links; improve form hierarchy and field error announcement after accessibility validation. |
| `/admissions/eligibility` | `InstitutionInfoPage` (`page="eligibility"`) | **WORKS.** Direct load rendered eligibility guidance. | Shared static template; intentionally asks users to confirm current rules. | Preserve disclaimer; make contact route/CTA visually clear. |
| `/admissions/how-to-apply` | `InstitutionInfoPage` (`page="apply"`) | **WORKS.** Direct load rendered application guidance. | Shared static template; dates/process are not published as confirmed facts. | Preserve caution; present steps only after institution approval. |
| `/campus` | `CampusPage` | **WORKS.** Direct load rendered facility cards. | Remote images must load from official image host; API is not needed for this page. | Improve responsive card consistency and ensure image crop/alt-text semantics. |
| `/facilities` | `InstitutionInfoPage` (`page="facilities"`) | **WORKS.** Direct load rendered facilities text and image. | Shared template and remote image dependency. | Reuse a consistent facility-card treatment if adding content; do not duplicate unverified claims. |
| `/gallery` | `GalleryPage` | **API ERROR.** After waiting, visible `role="alert"` showed `Request failed (500)`. | GET `public/gallery` failed with unavailable API. Gallery content, filters, and lightbox could not be populated/tested. | Restore API and test categories, image metadata, modal controls, focus, and empty/error states with approved records. |
| `/achievements` | `AchievementsPage` | **API ERROR.** After waiting, visible `role="alert"` showed `Request failed (500)`. | GET `public/achievements` failed with unavailable API. | Restore API and verify published/empty/error content states and attachment links. |
| `/events` | `EventsPage` | **API ERROR.** After waiting, visible `role="alert"` showed `Request failed (500)`. | GET `public/events` failed with unavailable API. | Restore API and verify pagination and populated event records. |
| `/events/:slug` | `ContentDetailPage` (`kind="events"`) | **API ERROR.** `/events/sample` showed an unavailable message and return link. | Detail API request failed with HTTP 500; no real event slug was available. | Verify endpoint, published slug, record, and detail layout against real safe test data. |
| `/notices` | `NoticesPage` | **API ERROR.** After waiting, visible `role="alert"` showed `Request failed (500)`. | GET `public/notices` failed with unavailable API. Search/pagination data behavior could not be verified. | Restore API and test debounce, search results, pagination, pinned notices, and attachments. |
| `/notices/:slug` | `ContentDetailPage` (`kind="notices"`) | **API ERROR.** `/notices/sample` showed an unavailable message and return link. | Detail API request failed with HTTP 500; no real published notice slug was available. | Verify endpoint, published slug, attachment behavior, and detail content. |
| `/contact` | `ContactPage` + `EnquiryForm` | **WORKS with missing settings.** Heading and enquiry form rendered. | Site-settings GET failed in the local API environment; contact fields fall back to a generic “not configured” message. | Verify public settings endpoint and configure institution-approved contact details; keep fallback available. |
| `/privacy-policy` | `InstitutionInfoPage` (`page="privacy"`) | **WORKS.** Direct load rendered policy text. | No route error observed. Policy notes deployment-specific data-handling needs. | Confirm retention/access/deletion language with the college before deployment. |
| `/terms` | `InstitutionInfoPage` (`page="terms"`) | **WORKS.** Direct load rendered terms text. | No route error observed. | Confirm legal terms and image permissions with the institution. |
| `/admin/login` | `AdminPage` → `AdminLogin` | **WORKS (sign-in view only).** Direct load rendered sign-in. No credentials entered. | Authentication/API behavior and login success were not tested. | Preserve authentication flow; visually improve form states without weakening security. |
| `/admin/dashboard` | `AdminPage` | **LIMITED.** Unauthenticated direct load showed sign-in, as expected. | Protected content requires valid session and working API; neither was exercised. | Test only with authorized non-production credentials and test data. |
| `/admin/:resource` | `AdminPage` | **LIMITED.** `/admin/courses` and `/admin/site-settings` showed sign-in when unauthenticated. | Content management requires authentication and API. Save/delete/upload actions were not tested. | Retain all admin capabilities; redesign separately from public pages and test authorized workflows in staging. |
| `*` (example `/does-not-exist`) | `NotFoundPage` | **WORKS.** Direct load rendered “Page not found” and return-home link. | Vite serves SPA shell with status 200 for unknown paths; React renders its wildcard route. Production host fallback is unverified. | Preserve 404 UI and configure the eventual host’s SPA fallback/HTTP 404 behavior appropriately. |

### Route and navigation diagnosis

- No incorrect React Router path or missing page import was found in `client/src/App.tsx`.
- Direct URLs, including nested routes and the wildcard route, loaded locally. This establishes local development behavior, not production refresh behavior.
- The route smoke test returned HTTP 200 from Vite for tested direct paths. API-backed pages separately failed when their API data request ran.
- The public-domain browser displayed legacy `.html` navigation and different page content; the local React/Vite app uses clean routes. The local repository does not establish that the public domain is connected to this project.
- The local browser logged API HTTP 500 responses. No API listener was observed at port 5001; a safe health request timed out. **Confirmed:** the API was unavailable from this audit session. **Unconfirmed:** why the API is unavailable, and whether production API endpoints fail.
- The mobile navigation opened and updated `aria-expanded`; Escape returned it to false. No link was clicked that could submit a form or trigger an external action.

## 4. Premium design recommendations

### Design principles

1. Preserve the professional college identity: deep navy, warm ivory, gold accents, editorial serif display type, and clean sans-serif body copy.
2. Improve contrast before adding polish. Previous measured ratios were 2.17:1 for `#C5A46D` on `#F8F5EF` and 3.75:1 for the eyebrow color `#9A7845` on ivory, both below the 4.5:1 normal-text threshold.
3. Define a small, consistent set of semantic color, typography, spacing, radius, shadow, and motion tokens; use those consistently across pages instead of accumulating new one-off values.
4. Keep the existing content and page sections. Upgrades should be additive refinements, not content removal or route consolidation.
5. Treat the current API error as an environment/service issue until a healthy API proves otherwise; do not disguise HTTP 500 as “no content.”

### Shared components

- **Header/navigation:** refine spacing and active/hover states, preserve sticky behavior and all current links, and make the mobile menu’s focus order/close behavior predictable. Keep the admissions CTA visible without crowding smaller widths.
- **Footer:** improve link grouping and contact hierarchy; retain privacy, terms, and existing navigation destinations.
- **Buttons/links:** establish primary, secondary, and text-link styles with consistent hover, pressed, disabled, and `:focus-visible` states.
- **Cards:** use consistent image ratio, heading scale, padding, border, and hover behavior. Avoid hover-only information and large scaling on touch devices.
- **Forms:** consistent labels, required/optional cues, inline error association, pending state, and result status. Retain React Hook Form/Zod validation and the existing API integration.
- **Loading/error/empty states:** use stable-height skeletons for genuinely loading data, accessible error messages with a retry affordance where safe, and a distinct empty state only after a successful empty response.
- **Typography:** preserve serif display/sans body pairing; use a clear, restrained type scale and responsive line lengths. Confirm font loading/fallbacks before selecting a custom font dependency.
- **Photography:** maintain subject focal points with responsive crops; verify image permissions and source quality. Prefer existing remote assets until an approved optimization strategy is selected.

### Page-specific design direction

| Page/group | Premium UI/UX proposal |
|---|---|
| Home | Keep the existing hero and all sections. Refine headline line breaks at mobile/tablet sizes, clarify the primary CTA, align image crops and section spacing, and improve API update-state messaging without hiding the static hero or enquiry CTA. |
| About | Introduce a more deliberate editorial split between narrative and building image; preserve approval/history links and image credit. |
| History | Present the existing dated milestones with a restrained timeline/chronology and readable dates, not a decorative infographic. |
| Principal message | Use a calm quote/message composition with image only where approved; keep attribution disclaimer intact. |
| Academics | Strengthen section hierarchy and visual grouping for institutional commitment, NCTE statement, and programme info; avoid implying unverified offerings. |
| Courses and course details | Use a consistent programme card/detail template with key verified facts grouped clearly; keep error, empty, and loading states distinct and retain admissions CTA/documents. |
| Admissions and eligibility/how-to-apply | Keep eligibility warnings prominent, clarify the enquiry path, and improve form labels/error spacing. Do not introduce unverified fees or deadlines. |
| Campus/facilities | Normalize card image proportions and text lengths; use consistent facility labels and captions while preserving all existing facility content. |
| Gallery | Improve category filter state contrast and card captions; retain keyboard-operable controls and refine modal layout/focus behavior before adding animation. |
| Achievements | Standardize date/category labels, optional image ratio, and supporting-document placement; show meaningful empty/error states. |
| Events | Make dates easy to scan, align image/text rows, and visibly distinguish pagination. Preserve venue and descriptions. |
| Notices | Keep search discoverable, improve result/empty messaging and pagination, and preserve pinned status and attachments. |
| Contact | Use a clear contact-information panel next to the shared enquiry form; show settings-loading/error/fallback deliberately, not as unexplained blank contact details. |
| Privacy/terms | Improve long-form reading width, heading hierarchy, and link styling; preserve policy/legal text until institution review. |
| Admin sign-in/dashboard | Treat as a separate utility UI: clear form feedback, resilient narrow-screen layout, consistent focus styles, and information density suitable for content management. Preserve auth and CRUD behavior. |
| Not found | Retain the simple 404 purpose; align styling to the shared brand and provide a clear home/navigation recovery path. |

## 5. Animation plan

Framer Motion is already installed and used. No new animation dependency is recommended for the proposed work.

| Effect | Target | Recommendation and guardrails |
|---|---|---|
| Hero entrance | Home hero text/CTAs | Short opacity + small vertical reveal with restrained stagger. Keep content visible if animation is disabled or JS is delayed. |
| Section reveals | Home editorial sections; optionally informational page headers | Use existing `whileInView` pattern selectively, with one-time entry and small transform distance. Do not animate every paragraph/card. |
| Image parallax | Home hero image only | Keep the existing subtle translation only if profiling confirms it is smooth. Disable for reduced motion and small/touch/low-power contexts if performance or image framing suffers. |
| Card interaction | Course, campus, gallery, event cards | Prefer border/shadow/color changes and a subtle image scale; keep transform short and avoid layout property animation. Touch interaction must not depend on hover. |
| Route transition | App route wrapper | Use a short, unobtrusive cross-fade only after confirming route scroll/focus behavior. Avoid exit sequencing that delays navigation or hides new content. |
| Mobile navigation | Shared header | Preserve the existing enter/exit treatment; ensure reduced-motion preference uses an immediate state change and focus/escape behavior remains intact. |
| Gallery lightbox | Gallery modal | Keep a simple opacity transition; first resolve keyboard trap/focus handling. Do not animate modal size or image dimensions. |
| Link underline/button feedback | Shared controls | Use CSS transitions for color/underline/transform; include keyboard focus and pressed states. |
| Statistics | None currently verified | Do not invent animated statistics. Add only if verified numerical content exists and approved copy is available. |
| Background/texture | Select section backgrounds | If added, use static CSS gradients/textures first. No continuous particle, WebGL, or 3D effects are justified by this institutional site. |

**Motion accessibility:** apply `prefers-reduced-motion` to Framer Motion components and explicit smooth scrolling, not just CSS transitions. Avoid pinned sections, scroll hijacking, `setTimeout` animation loops, animating width/height/top/left, or persistent `will-change`. Verify fast scrolling/resizing, touch behavior, and low-end mobile performance.

## 6. Mobile and accessibility considerations

- The previous audit measured the local **home page** at 390×844, 768×1024, 1366×768, 1440×900, and 1920×1080; no horizontal overflow was observed at those sizes. The route smoke test also had no horizontal overflow at its tested narrow viewport. Other route-specific combinations still need full manual/device QA.
- Keep the mobile menu operable with keyboard, Escape, visible focus, correct expanded state, and all current destinations. Do not allow a visual redesign to hide menu items or the admissions CTA.
- Fix the gallery modal’s current Tab behavior: it prevents every Tab and returns focus to the close button, so previous/next controls cannot be reached with normal Tab navigation.
- Add a skip-to-main link and maintain semantic landmarks/heading order.
- Use accessible contrast for body copy, eyebrow labels, muted text, button boundaries, and focus indicators. Measure text over actual image/gradient backgrounds.
- Associate form errors with inputs (`aria-describedby`/`aria-invalid` as appropriate) and test announcement of submission status. Do not submit a real enquiry as part of QA.
- Verify that CMS images with meaningful content receive appropriate alternative text; empty alt is appropriate only when decorative/redundant.
- Test at 200% zoom, keyboard-only, screen readers, touch targets, reduced motion, and mobile landscape.

## 7. Performance and technical risks

- **API/service availability — VERIFIED local:** `/api/health` at `localhost:5001` timed out and no listener was observed. This prevents successful content integration checks; it does not prove production API failure.
- **Silent secondary home data — VERIFIED source:** event/notice/achievement queries are optional; the update section appears only when content exists. A failure may visually resemble absent data. Preserve static sections but distinguish request failure from successful empty content.
- **Server type-check — VERIFIED prior check:** eight diagnostics in upload/admin route code block the configured server TypeScript build. They are separate from React route matching and do not explain the browser’s absent API service.
- **Client route loading — CODE-BASED RISK:** all page components, including admin, are statically imported. Consider lazy route loading only after bundle measurement and testing loading/fallback behavior; preserve direct route refresh.
- **Bundle baseline — NEEDS MANUAL TESTING:** existing `client/dist` JavaScript artifact was previously measured at about 521 KB uncompressed and is stale relative to source. Do not infer current production transfer size from it.
- **Remote images — CODE-BASED RISK:** fixed institutional photos are external; runtime CMS images are also remote. Validate availability, responsive sizes, formats, cache headers, and ownership. Keep hero priority and intrinsic sizing accurate for the installed React version.
- **Animation — CODE-BASED RISK:** Framer Motion transforms are generally preferable to layout animation, but no Lighthouse, Web Vitals, memory, or frame-time trace was run.
- **No dependency changes recommended.** The design plan can use existing Tailwind and Framer Motion. Do not mix backend TypeScript remediation into visual implementation unless a separate, explicitly approved backend task includes it.

## 8. Prioritized implementation plan and acceptance criteria

### Phase 1 — Fix broken pages and establish a working integration baseline

**Work**

- Confirm the expected local API startup/configuration and port 5001 without exposing secrets.
- Diagnose API health/HTTP 500 at the service boundary; verify public read endpoints with approved test data.
- Make failed optional home collections and failed contact settings distinguishable from successful empty/unconfigured states.
- Validate course/event/notice detail routes against real published slugs and confirm back links.
- Do not edit server TypeScript or deployment settings as part of this frontend/design phase; handle server compile errors separately.

**Acceptance criteria**

- Health and required public read APIs return expected success responses in a safe test environment.
- `/courses`, `/events`, `/notices`, `/gallery`, `/achievements`, `/contact`, and all detail templates each show the correct populated, successful-empty, loading, and failure behavior.
- API failure is never presented as “no records”; no page becomes blank when a request fails.
- Existing enquiry validation and submission behavior is preserved; no real form submission is used in acceptance testing.
- No route or section is removed.

### Phase 2 — Establish a consistent premium design system

**Work**

- Define semantic tokens for color, typography, spacing, borders, shadows, radii, and interactive states using the existing Tailwind/CSS setup.
- Establish accessible text and focus colors; document/measure contrast.
- Refine shared header, mobile navigation, footer, buttons, cards, content widths, form styles, and API loading/error/empty presentation.
- Apply page-specific recommendations while preserving all copy, sections, links, and integrations.

**Acceptance criteria**

- Shared components use consistent tokens and visual states across public pages and remain responsive.
- Normal text color combinations meet at least 4.5:1 contrast; large text and non-text UI boundaries meet applicable contrast criteria.
- Every interactive element has visible keyboard focus; mobile nav preserves all destinations.
- Existing content, route behavior, form schema, API calls, and admin capabilities remain present.

### Phase 3 — Add polished animations

**Work**

- Refine hero entrance, restrained section reveals, subtle hover feedback, and route transitions using existing Framer Motion/CSS.
- Preserve optional home parallax only if performance and reduced-motion checks support it.
- Add reduced-motion alternatives and disable motion where appropriate for touch/low-performance contexts.
- Avoid new animation packages, pinned scroll sections, scroll hijacking, and continuous decorative animation.

**Acceptance criteria**

- Motion is brief, purposeful, and does not shift document layout or obscure content.
- With `prefers-reduced-motion: reduce`, scripted entrance/parallax/scroll motion is removed or made immediate.
- Keyboard focus, route changes, mobile menu, and lightbox remain usable during/after transitions.
- No animation targets width/height/top/left; no uncleaned listeners/loops or console warnings are introduced.
- Fast scroll and resize tests reveal no flicker, stuck transforms, or overlapping transitions.

### Phase 4 — Validate routes, responsiveness, accessibility, and performance

**Work**

- Run a direct-load and refresh smoke test over every route, including unknown routes and nested detail/admin routes.
- Test public data pages with both populated and empty fixtures; test authenticated admin only in staging with authorized credentials.
- Check the five target viewports on each page family and test keyboard, screen reader, zoom, and reduced-motion behavior.
- Measure Web Vitals/Lighthouse, image transfers, bundle transfer size, and animation frame behavior on representative mobile hardware.
- Verify deployment rewrite behavior only against the confirmed host/environment; do not alter Vercel or production settings without separate authorization.

**Acceptance criteria**

- Every static route and tested dynamic route renders its intended page; direct refresh works in the intended deployment.
- No horizontal overflow, clipped critical text, broken navigation, missing assets, or uncaught runtime errors at target widths.
- All forms/controls are operable by keyboard and touch; no real external actions are triggered during tests.
- Performance budgets are agreed from measured baselines; no conclusion is based only on stale `dist` artifacts.
- Existing functionality, content, routes, and integrations are regression-checked and preserved.

## 9. Five most important issues and safest next step

1. **Local API unavailable:** data-backed routes return HTTP 500 locally; this is the direct cause of current missing dynamic content.
2. **Production mismatch remains unresolved:** public domain displays legacy `.html` pages rather than the local React route experience; deployment ownership is unknown.
3. **Server TypeScript build failure:** eight known diagnostics block the configured server compile, but are independent of frontend route rendering.
4. **Home page can obscure optional content failures:** failed event/notice/achievement queries may appear as absent updates instead of a service error.
5. **Accessibility blockers in the proposed polish baseline:** insufficient gold-on-light contrast and gallery lightbox Tab focus behavior need correction before adding richer motion.

**Single safest next step:** verify and restore the intended non-production API service at port 5001, then repeat the data-backed route checks with safe test data. This distinguishes real page defects from an unavailable backend without changing design, backend code, or production deployment.
