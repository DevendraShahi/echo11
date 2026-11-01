# Homepage hero fixes

Preserves the existing kinetic “Make your brand echo.” composition.

- Short and landscape viewports no longer force content into a clipped viewport-height stage. Below 620px viewport height, content scrolls naturally in a minimum 620px block.
- Normal sticky stage and following content overlap both use small viewport units, avoiding mixed vh/dvh sizing when mobile browser chrome changes.
- Scroll opacity retains the hero initially, then fades through progress 0.6 instead of becoming invisible at 0.22. Keyboard-focused actions keep their plane visible.
- On tall sticky stages, keyboard focus returns the hero to its starting position so the following content cannot obscure a focused action. Short stages retain natural scrolling.
- Secondary link has a 44px target, explicit focus styling, and a decorative arrow hidden from assistive technology. The complete h1 has an accessible name.
- Cyan DOM wordmark is present until an actual canvas glyph frame is painted, including when canvas context creation fails. Canvas lettering uses a brighter cyan wash.
- Canvas sleeps behind an inactive splash, when the page is hidden, and after the hero fades. Reduced-motion preference changes stop movement and paint a static wordmark. Pointer reactions are constrained to the stage. ResizeObserver also tracks the wordmark; late font callbacks stop after unmount.

Changed: `Hero.tsx`, `EchoField.tsx`, homepage `page.tsx`, the three home-hero rules in `globals.css`, and the project design guidance.

Validation: lint, TypeScript, and production build pass. Lint reports three existing image warnings in `LaltinApp.tsx`. Browser checks covered 320×568, 375×667, 844×390 landscape, and 1280×720 desktop, with no horizontal overflow or overlapping hero controls. Both contact and work destinations were verified; desktop work activation was verified by keyboard and direct pointer click. Canvas readiness and scroll fade were checked. Canvas failure and runtime reduced-motion preference switching are implemented but were not simulated in the browser.
