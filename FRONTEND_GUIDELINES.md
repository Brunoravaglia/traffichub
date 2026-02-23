# Frontend Guidelines

## Stack
- React + TypeScript + Vite
- Tailwind + shadcn/ui
- Framer Motion for UI transitions

## Component Rules
- Keep components single-purpose.
- Prefer composition over custom one-off wrappers.
- Keep interaction semantics valid (no button nested in link).

## Styling Rules
- Prefer tokenized Tailwind classes mapped to CSS variables.
- No hardcoded colors in feature/public UI.
- Keep responsive behavior fluid with `clamp()` where needed.

## Accessibility
- Min touch target on mobile: `44x44`.
- Ensure keyboard/focus states for all actionable controls.
- Tooltip actions must not conflict with primary click actions.

## Motion
- Motion must support hierarchy, not decoration.
- Use one transition language across navbar, cards, and drawers.

