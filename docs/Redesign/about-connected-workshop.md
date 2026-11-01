# About connected-workshop illustration

The About perspective section now uses public/images/brand/echo11-connected-workshop-v1.png in WebsiteWorkshop. Previous illustrative assets remain available for reversible comparison.

Built-in image generation used the user’s architectural interior reference as style inspiration. The final prompt called for an original transparent isometric workshop with a business owner and collaborator discussing a content map, a designer arranging page wireframes and an engineer building matching desktop/mobile layouts. Off-white editorial line art and a selective cyan path connect the actual work artifacts. It excludes the reference’s kitchen, cafe, yoga and lounge arrangements. The scene is conceptual, not evidence of an actual Echo11 office or team.

The image uses a contained 4:3 responsive frame, a finite reduced-motion-aware entrance and descriptive alt text. The section’s existing content and global horizon remain intact. Mobile width is 342px at a 390px viewport with no sideways overflow. Desktop review screenshot: /private/tmp/echo11-about-connected-workshop.png.

Hover refinement: an aria-hidden duplicate PNG supplies a hue-shifted color-blend layer inside an isolated illustration wrapper. This changes cyan details toward electric blue while preserving neutral linework and alpha. Fine-pointer hover fades the layer over 550ms; touch remains unchanged and reduced motion removes the transition. Pointer entry and exit were verified in the browser. Styling is scoped to AboutExperience.module.css.

Stronger hover response: cyan details now crossfade to vivid violet/pink. A responsive SVG overlay aligned to the source’s 1448×1086 coordinates sends short glowing dashes along the two connection paths over 2.8 seconds. CSS animation runs only during fine-pointer hover, pauses on exit, and the overlay fades out over 650ms. Reduced motion removes travel and transitions. Browser checks confirmed running on entry and paused on exit; preview saved at /private/tmp/echo11-about-animated-signal.png.
