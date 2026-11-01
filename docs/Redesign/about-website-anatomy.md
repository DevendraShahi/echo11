# About illustration: Anatomy of a considered website

Replaces the decorative chrome horizon sculpture in the About perspective section only. The image depicts a content/audience map, a matching website wireframe and a finished desktop/mobile interface. These parts give visible meaning to “The whole picture. Down to the details.” The customer benefit is a connected experience: understandable content, a clear next step and consistent presentation across screens.

Reference principles: isometric editorial illustrations, exploded technical assemblies, consistent projection, fine line-weight hierarchy, restrained colour and meaningful rather than arbitrary objects. No reference artwork was copied or included in the final asset.

Built-in image generation prompt direction: create a transparent isometric exploded website assembly with three aligned planes—audience/content planning below, editorial wireframe in the middle, and finished responsive website above. Use off-white technical outlines, charcoal fills and selective cyan, no chrome sculpture, gears, cranes, rockets, fake metrics or decorative ornaments. Show one matching mobile screen and preserve legibility at 450px.

Asset: public/images/brand/echo11-website-anatomy-v1.png. This is a native generated PNG with alpha, not a claimed 4K export. The previous image is retained as an unused version for reversibility.

Implementation: WebsiteAnatomy in AboutExperience, next/image object-contain, responsive square frame up to 560px, one finite reduced-motion-aware entrance, semantic alt text and a plain HTML caption. No global typography, horizon or other-page visual changes.

Desktop 1280px and mobile 390px verified: image loads, remains uncropped and mobile document has no sideways overflow. Screenshot: /private/tmp/echo11-about-website-anatomy.png.
