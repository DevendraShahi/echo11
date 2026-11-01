import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point for GSAP so every section shares one plugin
 * instance. Registration is guarded for SSR: ScrollTrigger only makes sense in
 * the browser, and importing it on the server must stay side-effect free.
 *
 * GSAP is reserved for scroll-scrubbed / pinned choreography (ScrollTrigger,
 * SplitText-style reveals). Everything else stays on framer-motion, and the two
 * never animate the same element.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
