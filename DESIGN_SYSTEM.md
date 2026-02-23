# Vurp Design System (Baseline)

## Principles
- Less but better: every element must justify itself.
- Hierarchy first: one primary action per screen.
- System over exceptions: no visual one-offs.

## Color Tokens
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--muted`, `--muted-foreground`
- `--border`, `--input`, `--ring`
- `--primary`, `--primary-foreground`
- `--accent`, `--accent-foreground`

Rule:
- Do not use hardcoded `#hex` or `rgba(...)` in components.
- Use `hsl(var(--token) / alpha)` for overlays and glows.

## Typography
- Font family: `Inter` (default UI), optional serif only for editorial mastheads.
- Scale:
  - Display: `clamp(2rem, 6vw, 4.25rem)`
  - H1: `clamp(1.75rem, 5vw, 3.25rem)`
  - H2: `clamp(1.375rem, 3vw, 2.25rem)`
  - Body: `0.98rem` to `1.12rem`
  - Caption: `0.72rem` to `0.82rem`
- Tracking:
  - Headings: `-0.02em` to `-0.01em`
  - Eyebrows/caps: `0.10em` to `0.18em`

## Spacing
- Base rhythm: `4, 8, 12, 16, 24, 32, 48, 64`.
- Section padding should use consistent vertical steps.
- Avoid mixed arbitrary paddings unless justified by component size.

## Radius / Border / Shadow
- Radius: `xl` and `2xl` as default surfaces.
- Borders: use `border-border` with alpha variants.
- Shadows:
  - Card: subtle depth only.
  - Glow: reserved to primary emphasis states.

## Motion
- Enter: 220-280ms
- Exit: 160-220ms
- Hover: 120-180ms
- Easing: smooth cubic-bezier (`0.22,1,0.36,1`) for entrance.

## Components (Visual Contracts)
- Navbar mobile drawer: glass panel + consistent list rhythm.
- Hero: eyebrow > title > description > primary CTA > secondary CTA.
- Utility card: explicit info action separate from primary navigation.

