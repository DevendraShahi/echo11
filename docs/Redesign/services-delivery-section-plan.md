# Plan — /services "Delivery and ownership" section redesign

**Intent:** Rebuild the *Delivery and ownership* band on `/services` (currently a 4-up card grid + a FAQ block crammed into the same section) into two clearly separated movements — an animated **delivery path** with an **ownership close**, then a standalone **questions** section — with purposeful scroll-in motion instead of one flat fade. Content stays 100% derived from existing records (`ProcessTimeline.steps`, `faqs`); nothing invented.

**Source of truth for this change:**
- Section as built today: `src/app/services/ServicesExperience.tsx:185-195`
- Step record (shared with home `/process`): `src/components/sections/ProcessTimeline.tsx` → `steps` (`num`, `title`, `does`, `youGet`, `fromYou`)
- FAQ copy: `ServicesExperience.tsx:63-67` (`faqs`)
- Rules: `docs/Redesign/phase4-art-direction-reset.md` (rejected patterns, motion rules), `docs/Redesign/echo11-page-anatomy.md` §6 (S4 working relationship, S5 questions), `docs/Redesign/home-audit.md:96` (open defect: cyan `01`–`04` on this surface)

---

## 1. Current state (what we are replacing)

One `<section>` doing two jobs, `border-t py-16 md:py-24` like every other band on the page. Neighbours: "Evidence in the work" (3 media cards, `:170`) above; "Your next chapter" closing (`:197`) below. The section directly above it, "Built into the approach" (`:163`), is also a row of `border-t` cells — the path must read differently from *that* too, not just from the cards it replaces.

1. `SectionHeading` — mono label "Delivery and ownership" + `RevealText` h2 "A clear path from first conversation to launch."
2. **One flat `Entrance`** wrapping a `lg:grid-cols-4` of equal cells: each cell = own `border-t`, **cyan `01`–`04`** (`LABEL !text-accent`), stage title, `does`, and a run-on `You keep: …` line joined with `". "`.
3. Two cues (`/process`, `/make-it-yours`).
4. A second, unlabelled sub-section inside the same band: "Before we begin / A few useful answers." + 3 FAQ rows (`border-b`).

## 2. Diagnosis — why it reads weak

- **Known art-direction defect, already logged:** the cyan `01`–`04` numerals are a standing rejected pattern; `home-audit.md` "Still open" says this surface was left alone rather than half-changed. This redesign closes that bullet.
- **Four equal bordered-top cells** sit in the rejected family (equal cards, per-row hairlines). The heading promises *"a clear path"* but the layout shows four disconnected boxes and nothing moves along a path.
- **Motion is one block fade.** Every section on this page uses the same `Entrance`; this one earns nothing from its own claim (progression, sequence, handover).
- **Two jobs, one section.** Delivery steps + pre-sales FAQs fuse S4 (working relationship) and S5 (questions) into a muddled tail.
- **`You keep:` run-ons** read as machine-joined strings (`"…list. The…rules…"`), the weakest expression of the section's actual differentiator: ownership.
- It **duplicates `/process` presentation** for free (shared `steps` record is correct and stays) — so this surface must earn its keep with *services-page framing*: what you receive and what you end up owning, not a second process engine.

## 3. Section goals

- Answer, in order: **How does delivery run? → What do I end up owning? → What stops me starting?** (anatomy S4 → S5).
- Make "path" literal: one continuous rail with a visible draw-in, stages arriving in sequence.
- Make **ownership the payoff**, not a clause: a distinct close band that aggregates what the record already promises.
- Fix the logged defects (cyan numerals, run-on `You keep`, two-jobs section) while keeping all real copy.
- Differentiate motion from neighbours without inventing a new signature effect for the page (home owns the big ones).

## 4. Proposed structure — one section becomes two

### Section A — `Delivery and ownership` (rebuilt in place)

| Beat | Content | Source |
| --- | --- | --- |
| A0 | `SectionHeading` label "Delivery and ownership" + existing h2 "A clear path from first conversation to launch." | unchanged copy, keeps the claim |
| A1 | **The path:** one continuous rail with 4 stages | `steps` |
| A2 | **Ownership close:** short h3 claim + aggregated inventory of what the client keeps | derived from `steps[].youGet` (deduped, verbatim fragments — no new promises) |
| A3 | Two cues: `Explore the delivery process` → `/process`, `Compare website options and pricing` → `/make-it-yours` | unchanged |

**A1 stage anatomy** (per stage, no card, no per-cell border):
- `num` — **neutral** (`text-white/30`), sequence marker; kills the cyan-numeral defect.
- `title` (`h3`, ~20px semibold).
- `does` — one line, `text-[14px] text-white/65`.
- **"You keep:" block** — label in `text-white/50`, items rendered as **separate lines** (not `. `-joined), each from `youGet`.

**A2 ownership close** (new sub-block, plain type on canvas — no panel):
- `RevealText` h3 — the claim must name the **artifacts that change hands**, not restate ownership as a quality: the section directly above already carries the card "A website you can own" / *"An agreed editing workflow, documentation, and a clear handover of the website and accounts."* (`foundations[4]`, `:56`), so that sentence and any close variant of it are **excluded here** (no echo 20 lines apart). Proposed copy: **"Everything it runs on, handed over."** *(OQ-1: wording)*
- **Inventory** of the aggregate `youGet` fragments as a run-in typographic list separated by `·` (scope and page map · visual direction · responsive page system · the build · content structure · QA, analytics, and the launch · the accounts) — read from `steps.flatMap(s => s.youGet)` at render time, deduped, so home/services can never drift and nothing is hard-coded twice.
- One short framing line is optional *(OQ-3)*; if added it must not paraphrase `foundations[4]`.

### Section B — `Questions` (new standalone section, same visual system)

- Own `border-t` + `SectionHeading` with **existing** strings: label "Before we begin", `RevealText` h2 "A few useful answers."
- The 3 `faqs` rows keep their current always-open treatment (crawlable, honest, only 3 items — *(OQ-2: accordion?)*), restyled as a two-column editorial list on `lg` (question left `0.7fr`, answer right `1.3fr` — the proportions already used by the current sub-block, promoted to a full section).

## 5. Layout spec

**Path (A1):**

- **`lg`+ — horizontal rail.** One shared top rule across the full row (`border-t border-white/15` on the container only), 4 equal columns hanging beneath it, each with a short tick descending from the rule (1×10px, `bg-white/25`) so the stages read as marks on one measured line, not four cards. Content stacks: num → title → does → you keep.
- **`< lg` — vertical rail.** Single `border-l` down the left, stages stacked with `pl-6`, each tick a horizontal 10px mark from the rule. (Two orientations of one structure — a responsive timeline, not a content fork; all four stages always visible.)
- **Ownership close (A2):** full-width band `mt-14` separated by one `border-t`, h3 + line left, inventory right on `lg` (`lg:grid-cols-[1fr_1.1fr]`); stacks on mobile. Generous internal padding (`pt-10`) so it reads as a landing beat, not a fifth card.
- **Spacing:** keep the page's shared section rhythm (`border-t … py-16 md:py-24`); internal gaps go `mt-12` (path) and `mt-14` (close) — slightly more air than the current `mt-10`, since this section now carries only one job.

**Questions (B):** current sub-block layout promoted to section scale; rows separated by the existing `border-b border-white/10`, generous `py` between.

**Rejected-pattern compliance:** no per-cell borders/cards, no cyan numerals, no badges/chips, no checkbox ticks, no em-dashes in visible copy, no grid backgrounds, no status dots (rail ticks are structural marks on the path, flat rectangles, not glowing dots).

## 6. Motion spec (the "better animation" ask)

House rules held: GSAP `RevealText` owns headings; framer-motion owns block entrances; never the same node; nothing infinite/decorative; `prefers-reduced-motion` leaves nothing hidden; core scope never hidden behind motion (everything ships in the DOM, motion only stages arrival).

| # | Beat | Mechanism | Timing |
| --- | --- | --- | --- |
| 1 | h2 claim | `RevealText` (via existing `SectionHeading`), ScrollTrigger `top 88%` | word stagger 0.055, blur 4 |
| 2 | **Rail draws** | framer `scaleX` 0→1, `origin-left` on the horizontal rule (`scaleY` / `origin-top` for the vertical variant), one viewport trigger | 0.9s, `EASE` |
| 3 | Stages arrive **along the path** | container `staggerChildren: 0.12`, `delayChildren: 0.25` (starts just after the rail begins drawing); each stage's num/title → does → you-keep as nested steps | 0.6s steps, 0.07 internal stagger |
| 4 | Ownership close | `RevealText` h3 + one `Entrance` for line + inventory | standard house entrance |
| 5 | Cues | single `Entrance` fade | 0.7s |
| 6 | Questions section | `RevealText` h2 + rows staggered as they enter | 0.09 between rows |

- All values via the existing `Entrance`/`EASE` helpers or the `startsAt`/`whenMoving` pattern already proven in `FeaturedWork`; `useReducedMotion` gates every start value (rail draws at full width instantly, stages render present).
- No hover animations beyond the existing `Cue` arrow nudge; no parallax, no loops — this page keeps one quiet register.

## 7. Content rules

- **Reused verbatim:** h2 claim, all 4 `does` strings, all `youGet` fragments, both cue labels, both FAQ Q&As.
- **Stays where it is (do not echo):** `foundations[4]` "A website you can own" + its sentence — it already answers the ownership *quality* one section above; this section answers the ownership *inventory*.
- **New copy (needs approval, OQ-1):** ownership close h3 (proposal: "Everything it runs on, handed over.") and optionally a one-line lead under the h2 — *(OQ-3)*.
- **Derived at render time:** ownership inventory = `steps.flatMap(s => s.youGet)`, deduped, rendered as separate lines / `·` run-in — no hard-coded duplicates.
- **Forbidden:** invented metrics, durations, client claims; em-dashes; new labels beyond the two existing ones.

## 8. Responsive checks

- 375 / 640 / 1024 / 1280: no horizontal scroll; vertical rail below `lg`, horizontal at `lg`+; stage text never squeezed below ~14ch; ownership band stacks cleanly; FAQ columns stack below `lg`.
- Touch targets ≥ 44px on both cues and any interactive row.
- Keyboard: cues and FAQ content fully reachable with visible cyan focus (existing `LINK` styles).

## 9. Acceptance checks (for the build pass)

1. `npx tsc --noEmit` 0 · `eslint` 0 · `npm run build` 0 (dev server stopped first, then restarted `NODE_ENV=development`, one server on :3000 — established protocol).
2. SSR greps on `/services`: **0** occurrences of the cyan-numeral pattern (`!text-accent` on step nums); rail rule present; 4 stages; ownership inventory present; **"A website you can own" appears exactly once** (the foundations card — not echoed by the close); two `SectionHeading`s (A and B); both cues; 3 FAQs; **0 em-dashes** in visible copy; heading order h1 → h2 → h3 intact.
3. Reduced-motion: no element left at opacity 0; rail at full width.
4. `/process` and home untouched (`steps` export unchanged — record keeps `num`/`title`/`does`/`youGet`).
5. Update `home-audit.md` "Still open" bullet 96 (cyan chips → fixed) and append a pass entry to `phase4-art-direction-reset.md`; note the change in `.opencode/skills/echo11-design/SKILL.md` if a house pattern moves.

## 10. Open questions (edit these in the doc)

- **OQ-1** Ownership-close h3 wording — current proposal: *"Everything it runs on, handed over."* (artifacts-focused; must not echo `foundations[4]`). Alternatives: "What changes hands at launch." / "Scope, design, build, accounts, all yours."
- **OQ-2** FAQs: stay always-open rows (proposal, crawlable, only 3) vs semantic `<details>`/accordion (anatomy permits it).
- **OQ-3** Optional line copy: a one-line lead under the h2 (e.g. naming that this is the same four-stage process `/process` details) and/or a short framing line in the ownership close. Default: **neither** — go claim → path → inventory. Any added line must not paraphrase `foundations[4]`.
- **OQ-4** Section split into A+B as proposed, or keep one section with an internal divider?

---

## Next step

1. Review this file — fix wording, answer **OQ-1…OQ-4** directly in it (or reply with your calls).
2. Then say **"build it"** and hand off to Design mode: the implementation touches only `src/app/services/ServicesExperience.tsx`, followed by the acceptance checks in §9.
