---
name: Nocturnal Command
colors:
  surface: '#0f1223'
  surface-dim: '#0f1223'
  surface-bright: '#35384a'
  surface-container-lowest: '#0a0d1d'
  surface-container-low: '#171b2b'
  surface-container: '#1b1f30'
  surface-container-high: '#26293b'
  surface-container-highest: '#313446'
  on-surface: '#dfe1f9'
  on-surface-variant: '#ccc3d3'
  inverse-surface: '#dfe1f9'
  inverse-on-surface: '#2c2f41'
  outline: '#968e9c'
  outline-variant: '#4a4451'
  surface-tint: '#d7baff'
  primary: '#d7baff'
  on-primary: '#411478'
  primary-container: '#bd93f9'
  on-primary-container: '#4e2484'
  inverse-primary: '#714aaa'
  secondary: '#75d4e8'
  on-secondary: '#00363e'
  secondary-container: '#008092'
  on-secondary-container: '#f8fdff'
  tertiary: '#ffafd7'
  on-tertiary: '#620044'
  tertiary-container: '#fe78c5'
  on-tertiary-container: '#770054'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eddcff'
  primary-fixed-dim: '#d7baff'
  on-primary-fixed: '#290055'
  on-primary-fixed-variant: '#593090'
  secondary-fixed: '#a3eeff'
  secondary-fixed-dim: '#75d4e8'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#ffd8e9'
  tertiary-fixed-dim: '#ffafd7'
  on-tertiary-fixed: '#3c0029'
  on-tertiary-fixed-variant: '#860f60'
  background: '#0f1223'
  on-background: '#dfe1f9'
  surface-variant: '#313446'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '450'
    lineHeight: 22px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '450'
    lineHeight: 18px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style

This design system is a high-performance, developer-centric interface inspired by the "Dracula" color palette. It balances a deep, focused dark mode with vibrant, neon-tinted syntax accents. The personality is professional, technical, and high-energy—designed for long-duration cognitive tasks like coding, debugging, and system monitoring.

The aesthetic blends **Modern Corporate** structure with **Subtle Neon** accents. It utilizes high-contrast foregrounds for maximum legibility and employs subtle glow effects on interactive states to mimic the luminescence of a high-end code editor. The goal is to evoke a sense of mastery and "flow state" for a technical audience.

## Colors

The palette is strictly dark-mode, rooted in the classic Dracula specification. 

- **Primary (Purple):** Used for primary actions, active navigation states, and brand identifiers.
- **Secondary (Cyan):** Used for information-rich accents, links, and secondary buttons.
- **Tertiary (Pink):** Reserved for highlights, notifications, and high-energy interactive feedback.
- **Surface & Background:** The UI utilizes `#282a36` for the base layer. Selection and hover states use `#44475a`.
- **Semantic Accents:** 
  - **Green:** Success and deployment status.
  - **Orange:** Warnings and pending states.
  - **Red:** Critical errors and destructive actions.
  - **Comment (Muted Blue):** Low-priority metadata and placeholder text.

## Typography

This design system uses a dual-font strategy to differentiate between interface navigation and technical content.

- **Inter:** Used for the primary UI framework. It provides a clean, neutral, and highly readable foundation for menus, headlines, and general body copy.
- **JetBrains Mono:** Used for all code snippets, data values, technical labels, and "Badge" text. This enforces the developer-centric aesthetic and ensures high character distinction (e.g., `0` vs `O`).

Large headlines should use tight letter spacing for a modern look, while code labels use increased tracking to maintain clarity at small sizes.

## Layout & Spacing

The layout follows a disciplined **Fluid Grid** model based on an 8px spacing rhythm. 

- **Desktop:** 12-column grid with 24px gutters. Content is centered with a max-width of 1440px.
- **Tablet:** 8-column grid with 20px gutters and 24px side margins.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Spacing should be used to create distinct "functional blocks." Use larger gaps (32px+) between disparate sections and tighter gaps (8px-16px) between related controls within a module.

## Elevation & Depth

Depth is achieved through **Tonal Layers** rather than heavy shadows. 

- **Base Layer (#282a36):** The primary canvas.
- **Content Layer (#44475a):** Used for cards, modals, and sidebars. This provides a subtle "lift" from the background.
- **Interactive Depth:** When an element is hovered, apply a subtle color-matched glow (`box-shadow: 0 0 15px [accent_color]33`).
- **Outlines:** Use 1px borders in the `#6272a4` (Comment) color for non-active elements to provide structural definition without creating visual clutter.

## Shapes

The design uses a **Rounded** shape language to soften the high-contrast technical aesthetic. 

- **Standard Elements:** 8px (`0.5rem`) for buttons, inputs, and small cards.
- **Large Containers:** 16px (`1rem`) for primary dashboard panels or modals.
- **Full Rounding:** Applied to status badges and tech chips to create a "pill" appearance that contrasts against the rectangular grid.

## Components

- **Buttons:** 
  - **Primary:** Solid Purple (`#bd93f9`) with black text for maximum contrast. On hover, add a purple glow.
  - **Secondary:** Outline in Cyan (`#8be9fd`) with Cyan text.
- **Inputs:** Dark background (`#282a36`) with a Comment-colored border (`#6272a4`). On focus, the border transitions to Purple with a subtle outer glow. Use JetBrains Mono for input text.
- **Tech Badges:** Small pill-shaped containers. Backgrounds use muted versions of the Dracula accents (e.g., 20% opacity Green) with 100% opacity text labels in JetBrains Mono.
- **Cards:** Use the Selection color (`#44475a`) for the card surface. Borders should be barely visible or omitted in favor of the tonal contrast against the background.
- **Lists:** High-density rows with 1px bottom dividers (`#44475a`). Hovering a row changes its background to a slightly lighter tint of the Selection color.
- **Status Indicators:** Small 8px circles using Green (Running), Orange (Warning), or Red (Stopped) with a CSS "pulse" animation for active critical states.