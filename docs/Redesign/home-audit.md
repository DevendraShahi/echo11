# Home audit: what earns its place, and what the process section has to become

An audit of the six sections on `/`, in the order a visitor meets them, judged on one
question only: **does this section change what a buyer believes or does?** Sections that
do not are either cut or given work to do.

Scope of the audit: the marketing copy, the structure, and the claims. Truthfulness rules
still hold: nothing invented, no metric that nobody measured, no link that does not answer.

## Section by section

### 1. Hero: keep

`We design and build digital products people trust.` with `A small, senior team for
strategy, design, and engineering. You work directly with the people building it` and two
actions, `Book Discovery` and `See the work`.

It earns its place. It says who the studio is, who is on the work, and offers the two
things a visitor wants at that moment: proof, or a conversation. One line is doing real
work: **you work directly with the people building it**, which is a promise the rest of the
page should keep rather than repeat.

### 2. Capabilities: keep, it is the services index

Heading, a paragraph about holding design and build together, four linked services, and a
closing line about what the shipped work spans. This is the part of the page that answers
"can you do the thing I need?", and each service links to `/services`, so it is a real
index rather than a placeholder. No change.

### 3. FeaturedWork (`Shipped, and documented.`): keep, it is the proof

Three real builds with real captures, sector and year, one honest line each, the services
delivered, a case-study link, and a single outbound link that answers a request
(`the-leadersnp.com`). The strongest section on the page. The open weakness is not the copy
but that nothing re-checks the URLs in `caseStudies.ts`.

### 4. MakeItYours (`Start from a proven direction.`): keep, it is the offer

Three directions, each drawn from a shipped build, with the real capture, the provenance
line, the price in the visitor's currency, the timeline, and one action. This is where a
visitor decides how to start. Recently reworked; no change in this pass.

### 5. ProcessTimeline (`How a project runs.`): required, but it was not doing its job

**Is it required?** Yes, but not as written. The question a buyer asks after choosing a
direction is not "what are your phases"; it is **"how much of my time does this take, what
do I actually get, and what do I have to do?"** A studio that answers those questions with
specifics lowers the perceived risk of hiring it. The section was the only place on the page
positioned to answer them, and it answered none.

**What was wrong with it:**

- **It said nothing.** `We build clean, testable systems with dependable release practices,
  balancing delivery speed with long-term maintainability` is true of every studio on earth.
  The three labels under each stage (`Interface Direction`, `Component System`, `Motion
  Rules`) are jargon with no artifact behind them.
- **It promised things it never delivered.** The section's own subhead claimed `You will
  always know what is happening, what we need from you, and what comes next`, and no stage
  ever said what it needed from the client.
- **It was disconnected from the offer directly above it.** Two scopes are published in
  [website-offers.ts](../../src/lib/website-offers.ts) with timelines (`3–5 weeks`,
  `6–10 weeks`) and a list of what each includes. The process section never mentioned either
  path, so the timelines and the stages never met.
- **It broke the art direction's own rules.** Big cyan `01`–`04` numerals, a `35vw` ghost
  numeral behind the illustration, rotating rings with glow dots, pulse circles, and inactive
  stages dimmed to `0.15` opacity plus a blur. Routine cyan numerals and decorative status
  motion were banned at the start of this reset, and unreadable dimmed text is the opposite
  of meaning.
- **It carried four infinite animations** (`repeat: Infinity`) that the reduced-motion
  policy had to keep standing down.

**What it becomes:** `What you get, stage by stage`. Same four stages, same order, same
heading, but every stage now states what happens, what exists at the end of it, and the one
thing the studio needs from the client to move on. The deliverables are the ones the two
published scopes already promise, so no new claim enters the page. The two paths with their
timelines sit beside the stages, which is the missing link between the offer above and the
work below. No numerals, no abstract art, no dimming, no infinite loops.

### 6. CTABanner (`Tell us what you are building.`): keep, it is the ask

One sentence and one action, after the proof and after the offer. Nothing to fix.

## What this pass changed

- [ProcessTimeline.tsx](../../src/components/sections/ProcessTimeline.tsx) rebuilt around a
  stage record that carries `does`, `youGet`, and `fromYou`; the four abstract visuals, the
  numerals, the ghost numeral, the blur and dim mechanic, and all four infinite animations
  are gone. The `steps` export keeps `num` and `title`, so `/services` is untouched.
- The section now names the two published scopes and their timelines, and links to
  `/make-it-yours` for what each includes. Prices stay in the offer section, where the
  currency switcher lives, rather than being printed twice with two states.
- Home and `/process` render the same content, so the two routes cannot drift apart.

## Still open

- ~~The `/services` stage chips still print `01`–`04` in cyan from the same record.~~ Closed by
  phase4 pass 26: the delivery band is now a drawn rail with neutral numerals.
- The `/process` page below the stages keeps its own older treatment.
- Nothing on Home says what a project costs after the range shown in the offer section.
