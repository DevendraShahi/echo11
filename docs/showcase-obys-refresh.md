# Showcase: immersive portfolio browser

Reference: https://obys.agency/ inspected live on 2026-10-10. Its work-first stream, persistent index, metadata frame and alternate gallery modes informed the direction. Echo11 retains its dark/cyan identity, original Syne/JetBrains fonts, imagery and copy. No reference assets were copied.

All 13 canonical case studies plus LALTIN and pizzaslice appear in Vertical and Grid modes on desktop, and Horizontal and Grid modes on mobile (700px breakpoint). Resizing preserves Grid or switches to the supported primary mode while retaining the active project. Native gallery scrolling drives active project metadata, desktop index and progress. GSAP Flip morphs image geometry between modes. Three.js applies a small velocity-driven bend and chromatic shift during scrolling, then sleeps when idle. Images retain their aspect ratio. Grid and reduced motion use normal DOM imagery; WebGL failure preserves the gallery.

Mobile uses large central images and readable persistent captions, with native vertical/sideways scrolling. Three concepts have live dialogs with device controls, automatic mobile sizing, Escape and focus return. Other projects link to their case studies. Provenance remains explicit, outbound links require verification, restaurant details are illustrative and Green Lifestyle imagery is editorial.

scripts/generate-showcase.cjs generates public/showcase.html from canonical data and the two additional concepts; npm prebuild regenerates it and checks local assets. Styling, interactions and rendering live in public/showcase/showcase.css, showcase.js and showcase-webgl.js. No migrations or new packages are required.

Manual checks cover desktop and 320/390px layouts, mode switching, scroll-driven selection, live pizza preview, Escape/focus return and console errors. Physical touch and OS reduced-motion switching have not been exercised.

Wheel input in either axis moves along the active gallery axis. Primary touch or mouse drags accept either direction with finite release momentum; dragging suppresses accidental link activation. Grid retains native touch scrolling and pinch zoom remains available.

The moving image stream is clipped to the same central stage for WebGL and DOM fallback images. Desktop columns use explicit gutters; long project names use a smaller unbroken title scale. Wheel/drag releases settle to the nearest project rather than leaving two cropped fragments visible.
