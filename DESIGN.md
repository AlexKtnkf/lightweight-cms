# Dietician Website Design System

## Design Philosophy
**Style:** Warm & Professional - Friendly, approachable, health-focused  
**Color Palette:** Based on existing brand colors - vibrant green (#22B573) and warm gold (#E9C46A)  
**Typography:** Fira Sans (existing brand font)  
**Goal:** Build trust, convey expertise, encourage consultation bookings while maintaining brand consistency

## Color Palette

### Primary Colors (Brand)
- **Primary Green:** `#22B573` (RGB: rgb(34, 181, 115))
  - Usage: Headings, primary buttons, links, brand elements
  - Psychology: Health, vitality, growth, trust

- **Primary Green Light:** `#4ECB8A`
  - Usage: Hover states, subtle backgrounds, icons

- **Primary Green Dark:** `#1A8F5A`
  - Usage: Active states, pressed buttons, emphasis

### Secondary Colors (Brand)
- **Secondary Gold:** `#E9C46A` (RGB: rgb(233, 196, 106))
  - Usage: Secondary buttons, accents, highlights, CTAs
  - Psychology: Warmth, optimism, energy, natural

- **Gold Light:** `#F2D08A`
  - Usage: Subtle backgrounds, card accents

- **Gold Dark:** `#D4B05A`
  - Usage: Hover states, emphasis

### Gradient Overlay
- **Gradient Overlay:** `rgba(34, 181, 115, 0.5)`
  - Usage: Hero backgrounds, section overlays, gradient effects (155deg angle)

### Neutral Colors
- **Warm Beige:** `#F5F1E8` - Main backgrounds, card backgrounds
- **Cream White:** `#FAF9F6` - Alternate sections, card backgrounds
- **Charcoal:** `#2C3E2D` - Primary text (WCAG AA compliant)
- **Soft Gray:** `#6B7A6B` - Secondary text, captions, meta information
- **Pure White:** `#FFFFFF` - Text on colored backgrounds, contrast

## Typography

### Font Stack
- **Primary:** `Fira Sans, "Segoe UI", Arial, Helvetica, sans-serif`
- **Weight:** 300 (light) for body, 400-600 for headings

### Type Scale
- **H1 (Hero):** 3.5rem (56px) mobile, 4rem (64px) desktop - Weight: 400
- **H2 (Section):** 2.5rem (40px) mobile, 3rem (48px) desktop - Weight: 400
- **H3 (Subsection):** 1.75rem (28px) - Weight: 500
- **H4 (Card titles):** 1.5rem (24px) - Weight: 500
- **Body:** 1rem (16px) - Weight: 300
- **Small:** 0.875rem (14px) - Weight: 300

### Line Heights
- Headings: 1.2 (tight, impactful)
- Body: 1.6 (comfortable reading)
- Small: 1.5

## Spacing System

Base Unit: 8px
- **XS:** 4px (0.5rem)
- **S:** 8px (0.5rem)
- **M:** 16px (1rem)
- **L:** 24px (1.5rem)
- **XL:** 32px (2rem)
- **XXL:** 48px (3rem)
- **XXXL:** 64px (4rem)
- **Section spacing:** 80px (5rem)

## Component Specifications

### Hero Section
- Background: Gradient 155deg from `rgba(34, 181, 115, 0.5)` to `#FFFFFF`
- Layout: Two-column grid (logo left, content right) on desktop, stacked on mobile
- Logo: Large, prominent (android-chrome-512x512.png)
- Title: H1, Primary Green, weight 400
- Subtitle: H2, Soft Gray, weight 400
- Buttons: Primary (Green) and Secondary (Gold border)
- Wave animation: SVG waves at bottom (60px height)

### Navigation Bar
- Background: Transparent initially, white with shadow on scroll
- Height: 64px
- Logo: 24x24px (android-chrome-192x192.png)
- Links: Uppercase, Soft Gray, hover to Primary Green with underline animation

### Feature Cards (Accroches)
- Layout: 3-column grid (1-column mobile)
- Background: White
- Border: 1px Primary Green Light
- Border-radius: 12px
- Padding: 32px
- Shadow: Subtle green-tinted shadow
- Hover: Lift effect, shadow increase

### Buttons
- **Primary (Green):** Background Primary Green, white text, 8px radius, hover to Dark Green
- **Secondary (Gold):** Transparent, Gold border, Gold text, hover to Gold background

## Responsive Breakpoints
- **Mobile:** < 768px (single column, stacked)
- **Tablet:** 768px - 1024px (2 columns where appropriate)
- **Desktop:** > 1024px (full layout)

## Accessibility
- All text meets WCAG AA (4.5:1 minimum)
- Focus states: 2px Primary Green outline
- Touch targets: Minimum 44x44px
- Text size: Minimum 16px for body
- Skip links available
- Respects prefers-reduced-motion

## Brand Assets
- Logo files from `adeline-hage/app/public/` copied to `lightweight-cms/public/`
- Favicon set maintained
- Doctolib icon available for appointment booking
