# Sri Aurobindo College of Education — Design System

This document is the canonical source for the public website’s visual tokens. The implementation lives in `client/src/styles/index.css` and `client/tailwind.config.js`.

## Direction

Warm, welcoming editorial design for prospective students. Purple and indigo anchor major surfaces, coral carries primary actions, and gold and teal are reserved for emphasis and detail. Plus Jakarta Sans headings pair with Inter body copy. Layouts use an airy 8px rhythm, readable content widths, rounded cards, restrained borders, and soft elevation.

## Color

| Token | Value | Use |
|---|---|---|
| Royal purple | `#5526A8` | Primary brand surface and links on pale lavender |
| Deep indigo | `#29205F` | Hero and promotional gradients |
| Vibrant violet | `#8057E8` | Secondary brand accent |
| Coral | `#FF7657` | Primary action background; use dark ink text |
| Golden yellow | `#FFC857` | Highlights, focus, and decorative accents |
| Fresh teal | `#28B8A5` | Achievement and interactive accents; use dark ink text |
| Soft lavender | `#F1ECFF` | Secondary section surface |
| Warm cream | `#FFF9F0` | Page background |
| Dark navy | `#17182D` | Main text and dark surface |
| White | `#FFFFFF` | Content surfaces and text on dark backgrounds |
| Body text | `#4B4A5E` | Secondary body copy |
| Muted body text | `#5B5B6D` | Secondary text on light surfaces |
| Gold text | `#735100` | Small gold-colored text on light surfaces |
| Teal text | `#075D54` | Small teal-colored text on light surfaces |
| Border | `#E3DCEC` | Subtle boundaries on light surfaces |

Use `#17182D` on coral, gold, and teal fills. Use white text on royal purple, deep indigo, and vibrant violet. Do not use pale accent colors for small text on light backgrounds.

Contrast ratios (WCAG relative luminance): dark navy on warm cream `16.65:1`; body text on warm cream `8.22:1`; gold text on warm cream `6.90:1`; white on royal purple `9.42:1`; white on vibrant violet `4.72:1`; dark navy on coral `6.62:1`; dark navy on gold `11.33:1`; dark navy on teal `7.05:1`; royal purple on soft lavender `8.16:1`.

## Typography

- Heading: Plus Jakarta Sans, then Inter, system UI, sans-serif.
- Body and navigation: Inter, then system UI, sans-serif.
- H1: `clamp(2.2rem, 5.5vw, 4rem)`.
- H2: `clamp(1.7rem, 3.5vw, 2.6rem)`.
- H3: approximately `1.2rem`.
- Body: `1rem` with `1.7` line height.
- Eyebrows: uppercase, semibold, approximately `0.72rem`, `0.16em` tracking.

## Layout and spacing

- Content max width: `1180px`; outer page shell allows `20px` minimum horizontal padding.
- Section spacing: `clamp(56px, 8vw, 104px)`.
- Spacing scale: `4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96px`.
- Breakpoints: use the existing Tailwind breakpoints; the homepage’s primary layout changes at `960px` and `560px`.

## Shape and elevation

| Token | Value | Use |
|---|---:|---|
| Small radius | `10px` | Inputs, compact controls |
| Medium radius | `18px` | Cards and buttons |
| Large radius | `28px` | Hero and feature surfaces |
| Pill radius | `9999px` | Chips and pill actions |
| Card shadow | `0 16px 44px rgb(41 32 95 / 12%)` | Raised cards |
| Header shadow | `0 8px 24px rgb(23 24 45 / 8%)` | Scrolled sticky header |

## Components

- Primary button: coral background, dark navy text, pill radius; hover lifts `2px`.
- Secondary button: transparent or white surface with a visible border; hover changes the surface without reducing contrast.
- Card: white, lavender, or cream surface; medium radius, subtle border, and card shadow on hover.
- Inputs: white surface, dark navy text, visible labels, gold focus outline, and inline associated errors.
- Links: dark navy on light surfaces, white on dark surfaces; underline or grow an underline on hover.
- Focus: `3px` solid golden yellow with `3px` offset.

## Motion

- Easing: `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- Fast interaction: `200ms`.
- Scroll reveal: `700ms`, opacity and vertical transform from `24px`, once per section.
- Hero entrance: `800ms` with a `100ms` stagger.
- Gallery image hover: `500ms`; lightbox fade: `250ms`; image scale: `300ms`.
- Button hover: translate up `2px`; card hover: translate up `4px`.
- No parallax, bounce, scroll hijacking, layout-property animation, or continuous decorative motion.
- With reduced motion enabled, reveal content immediately and remove nonessential movement.

## Theme

The existing application does not provide system-based dark mode. This design system defines the current light theme only; it does not introduce a theme switcher or silently change the app’s theme behavior.
