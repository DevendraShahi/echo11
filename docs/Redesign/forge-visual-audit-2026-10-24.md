# FORGE visual audit

Audited the running `/showcase/forge` at 1440×1000 and 390×844 on October 24, 2026. Reviewed the HTML, CSS, and interaction/motion sources. This is an audit; no showcase implementation was changed.

## Direction

Retain the performance-club identity: Archivo Narrow display type, bone/ember/charcoal palette, sharp rules, practical mono labels, strong athlete photography, and controlled cinematic transitions. The next pass should improve art direction, pacing, and completion rather than add more effects.

## Priority findings

| Priority | Area | Evidence | Recommended change |
| --- | --- | --- | --- |
| High | Photography consistency | The Facility “Training Floor” photograph is a bright open studio, while its caption promises racks and platforms. Training cards also do not always depict the activity described. | Curate one coherent industrial performance-club image family. Match each photograph to its caption and use a consistent exposure/color treatment. Retain visible detail in faces and equipment. |
| High | Desktop pacing | At a 1000px-tall viewport, Forging reserves 4200px and Facility 5200px. Training starts roughly six viewport lengths into the document. | Make Forging a short, memorable transformation and keep Facility as the single longer photographic sequence. Aim for the training offer within roughly the first two to three viewport lengths, validating by real scrolling rather than anchor jumps. |
| High | Training duplication | Four editorial program rows are followed by three separate training cards describing the same disciplines. Mobile Training measures about 4030px at an 844px-tall viewport. | Use one presentation per discipline: four image-led editorial entries with a clear program detail/selection action. Remove the second three-card presentation after preserving any unique level/duration information. |
| High | Mobile hero | The hero inner wrapper overrides the shell width with `width:100%`. Text/metadata sit flush to screen edges, and the image crop pushes the athlete toward the left edge. | Restore a consistent mobile gutter, rebalance the athlete crop, and create deliberate spacing between the three title lines. Keep both actions comfortably above the viewport bottom, tested at short and tall phone sizes. |
| High | Demo completion | Membership Join links go to the footer; Read Article links back to `#journal`; footer shows four bracketed “to confirm” values. | Provide a complete, explicitly illustrative membership interaction and a readable journal demo or remove misleading action cues. Replace placeholders with a designed concept ending and an Echo11 case-study/project inquiry route. Do not invent real contact information. |
| Medium | Coach presentation | The existing portrait scale and large areas of black create a distant composition. A Next coach control exists and works. The Numbers section says six coaches while the carousel contains five. | Reframe portraits consistently and pair each with a concise specialty, selected-state index, and visible next control. Resolve the concept count without inventing an additional person. |
| Medium | Membership | Three tiers have almost identical visual emphasis, while JOIN is a small text action. On a phone, one tier nearly fills the screen. | Strengthen price/action hierarchy, tighten empty vertical space, and use an intentional emphasis treatment for one tier if editorially appropriate. Avoid unverified “most popular” claims. Preserve the comparison and accessible controls. |
| Medium | Contrast and rhythm | Long dark stretches and quiet gray text make parts of the page feel similar despite the strong type system. | Use selective brighter photography, stronger paragraph contrast, and controlled carbon/steel surface changes. Keep ember for key actions and selected states. Do not add decorative colors or unrelated card styles. |
| Medium | Floating previews | The cursor-following image treatment can cover other content in the training area. | Keep previews within a predictable media area or tightly bound their position and size. Preserve a complete touch/keyboard presentation. |
| Medium | Journal | The editorial composition is useful, but the self-link fails to deliver the article it advertises. The photograph's literal description should match the image. | Keep one editorial feature with a real demo article or expandable reading view. Align the image and accessible description with the actual recovery subject. |

## Section-level plan

1. **Hero:** consistent gutter; stronger mobile crop; compact supporting sentence; two visible actions.
2. **Manifesto:** retain the short statement, reduce the ceremonial space around it.
3. **Forging:** retain one distinctive transformation, shorten its scroll track.
4. **Training:** four complete program entries, one representation each.
5. **Facility:** strongest image-led feature; consistent facility imagery and useful progress/next cues; native swipe on mobile.
6. **Numbers:** compact evidence strip with consistent illustrative facts.
7. **Coaches:** closer portraits, unified photographic treatment, clearer identity and specialty.
8. **Schedule:** retain the strong mobile stacked layout; clarify that dates/availability are demo content and provide an honest action.
9. **Membership:** clearer comparison and convincing demonstration of selection, without pretending to transact.
10. **Journal:** one complete editorial story experience.
11. **Footer:** a deliberate studio-concept ending with useful destinations, without unfinished placeholders.

## What already works

- Distinct condensed typography and a coherent dark industrial palette.
- Mobile menu is large and readable.
- Schedule adapts into readable stacked mobile rows without page overflow at 390px.
- Coach switching works.
- Motion source includes mobile/reduced-motion fallbacks and an initialization fail-safe. Preserve these.
- Facility's large photographic strip has the potential to be the strongest visual section once its imagery is consistent.

## Order of implementation

1. Fix imagery/content mismatches, mobile hero gutter/crop, placeholder ending, and misleading links.
2. Consolidate Training and shorten the pinned sequences.
3. Refine coach portraits, membership emphasis, contrast, and interaction details.
4. Verify real scrolling, anchor navigation, keyboard/menu use, short phones, reduced motion, and showcase embedding.

Any new real gym address, prices, schedules, staff identity/claims, testimonials, or lead/payment destination needs confirmed source information. The existing page is an Echo11-owned concept; visual improvements can remain illustrative. No new backend, payment flow, or real-gym claims are implied by this audit.
