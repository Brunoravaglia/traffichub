# Lessons Learned

## Design Consistency
- Without repo-level design docs, visual regressions repeat quickly.
- Token discipline prevents theme drift across dark/light variants.

## Mobile UX
- Small helper actions inside clickable cards create accidental navigation.
- Minimum 44x44 touch targets significantly reduce friction.

## Hierarchy
- Oversized hero headlines can break perceived trust and readability.
- Primary CTA should dominate; secondary actions should support, not compete.

## Motion
- Drawer animation quality depends more on rhythm and contrast control than on complexity.
- A quiet interaction is often more premium than a flashy one.

## Phase 2 Refinement
- On conversion-focused heroes, reducing headline aggression improves trust and first-read comprehension.
- Mobile navigation readability depends heavily on panel contrast in light mode; glassmorphism needs a stronger border floor.
- Dense utility grids perform better with tighter copy hierarchy (title > subtitle > description) and smaller but consistent paddings.
- Maintaining fixed 44x44 helper actions preserves touch usability even when cards become denser.

## Phase 3 Polish
- High-value routes must never rely on implicit loading/null states; explicit error-recovery UI avoids “black screen” perception.
- Global lazy-loading fallback quality directly impacts perceived product reliability.
- Focus-visible and focus-within styles are a premium quality signal, not only accessibility compliance.
