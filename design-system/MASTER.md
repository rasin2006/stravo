# Stravo Design System — Master

Map-first outdoor trail discovery. Earth tones + trust greens.

## Colors

| Token | Value | Use |
|-------|-------|-----|
| `--color-primary` | `#2D6A4F` | Brand, primary actions, active tab |
| `--color-on-primary` | `#FFFFFF` | Text on primary |
| `--color-secondary` | `#52796F` | Secondary buttons, chips |
| `--color-accent` | `#D4A373` | Record FAB, highlights |
| `--color-route` | `#2563EB` | Map polylines |
| `--color-background` | `#F7F5F0` | App chrome |
| `--color-surface` | `#FFFFFF` | Cards, sheets |
| `--color-foreground` | `#1B4332` | Headings |
| `--color-muted` | `#64748B` | Body text |
| `--color-border` | `#E2E8D8` | Borders |
| `--color-destructive` | `#DC2626` | Errors, negative feedback |
| `--color-recording` | `#EF4444` | Live recording indicator |
| `--color-score-high` | `#2D6A4F` | High-interest segments |
| `--color-score-mid` | `#94A3B8` | Unrated segments |
| `--color-score-low` | `#DC2626` | Low-interest segments |
| `--color-map-dark` | `#0F172A` | Dark map chrome |

## Typography

- **Headings**: DM Sans, 600 weight
- **Body**: Inter, 400 weight
- **Scale**: 32px hero, 24px h1, 17px body, 13px caption

## Spacing (4px base)

4, 8, 12, 16, 24, 32, 48

## Radius

- Inputs: 8px
- Cards: 12px
- Pills / FAB: 999px

## Shadows

- Card: `0 2px 8px rgba(27, 67, 50, 0.08)`
- Sheet: `0 -4px 24px rgba(27, 67, 50, 0.12)`
- Map overlays: none

## Motion

- Transitions: 200ms ease
- Respect `prefers-reduced-motion`

## Components

- **Button**: min-height 44px, pill or rounded-rect
- **Card**: white surface, 12px radius, subtle shadow
- **StatChip**: inline metric pill for distance/duration
- **BottomSheet**: rounded top corners, drag handle, map overlay safe

## Anti-patterns

- No emoji as icons
- No low-contrast gray-on-gray body text
- No form-heavy scroll on map screens
- No default RN Button styling in production UI
