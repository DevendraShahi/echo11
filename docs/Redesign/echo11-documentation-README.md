# Echo11 website documentation

**Status:** Draft documentation set · **Date:** 2026-10-01  
**Purpose:** Coordinate research, frontend standards, page structure, and motion without confusing reference-site observations with approved Echo11 requirements.

## Read in this order

| Order | Delivered document | Authority | What it covers |
|---|---|---|---|
| 1 | `echo11-reference-research.md` | Research, **not** requirements | PRODUX evidence ledger, technology reports, typography/layout research, skill resources, measurement protocol. |
| 2 | `echo11-frontend-foundation.md` | Candidate cross-site standards until audited and approved | Existing-code audit, frontend architecture, CSS token strategy, type, spacing, grids, responsive rules, quality constraints. |
| 3 | `echo11-page-anatomy.md` | Proposed route/content requirements until approved | Shared shell, per-page section anatomy, content gates, component contracts, route acceptance matrix. |
| 4 | `echo11-motion-and-interactions.md` | Candidate effect contracts until approved | Motion tiers, state, lifecycle, scroll, WebGL, reduced-motion, performance verification. |

**Note:** These four files were delivered as separate artifacts in this conversation. This README is the navigation/decision guide; it does not assert that they have been committed together to a repository.

## Authority and conflict rules

1. The current, inspected Echo11 repository and deployed UI establish **what exists**. The owner’s current direction establishes **what should change**. Old drafts and unverified memory do not override either.
2. The foundation governs approved shared tokens, architecture, accessibility, and performance. A page document can declare a justified local exception but cannot silently change a global token.
3. Page anatomy governs content purpose, route order, and section contracts; motion cannot remove or delay required content.
4. The motion document governs an approved effect’s triggers, ownership, state, fallback, and cleanup. If an effect conflicts with accessibility or page clarity, simplify or remove it.
5. Reference research establishes only what its sources support. A third-party detection, visual impression, or similar repo is not a mandate for Echo11 and not proof of PRODUX source code.
6. Legal claims, client names, metrics, media rights, pricing, and services require separate owner verification before publication.

## Evidence labels

- **VERIFIED:** Checked in actual Echo11 code, computed browser output, or owner-approved content; note source path, commit/URL, viewport, date.
- **KNOWN CONTEXT:** Previously supplied by owner but not recently confirmed against live code.
- **PROPOSED:** Draft recommendation or candidate token/effect; not implementation approval.
- **REFERENCE:** Observation or report concerning another site.
- **OPEN:** Unresolved requirement or measurement.

Do not turn an OPEN item into a numeric CSS value or build dependency by guesswork. In particular, candidate CSS values in `echo11-frontend-foundation.md` are examples, not measured Echo11/PRODUX values.

## Current next action

**Perform an Echo11 code and UI audit before implementing from these files.** The connected GitHub search did not locate the expected public `echo11-web` repository under the previously known account; this may reflect a different name or a private/other-owner repository. Confirm the correct repo/branch and read `AGENTS.md`, package manifest, route tree, global styles, fonts, components, and existing Lab. Capture representative page screenshots and computed type/layout values.

Record audit findings in a table:

| Item | Current evidence | Keep/change/add/omit | Proposed decision | Owner/date | Status |
|---|---|---|---|---|---|
| Global palette | OPEN | OPEN | Compare current CSS to candidate tokens | OPEN | OPEN |
| Styling setup | OPEN | OPEN | Preserve existing unless change justified | OPEN | OPEN |
| Type/fonts | OPEN | OPEN | Confirm licenses and loaded families | OPEN | OPEN |
| Spacing/grid | OPEN | OPEN | Measure real pages before approving scale | OPEN | OPEN |
| Motion libraries | OPEN | OPEN | Assign one owner to each animated property | OPEN | OPEN |
| Work/case studies | OPEN | OPEN | Verify content permissions and proof | OPEN | OPEN |
| `/lab` | OPEN | OPEN | Audit and prioritize improvements | OPEN | OPEN |

## Approval gates

### Gate 1 — Audit complete
Repository, deployed site, route inventory, responsive screenshots, token mapping, dependencies, current test results, and actual content availability are recorded. Do not treat documentation as a redesign brief before this gate.

### Gate 2 — Foundation approved
Owner signs off on token values, font licenses, styling strategy, page gutter/reading widths, component boundaries, and accessibility/performance standards. Candidate CSS becomes an approved implementation specification only here.

### Gate 3 — Page scope approved
Each route/section in the page anatomy is marked KEEP, CHANGE, ADD, or OMIT. Tier A pages have real content and an action. Optional pages are deferred until maintainable.

### Gate 4 — Motion approved
Each selected effect has purpose, state owner, asset budget, fallback, reduced-motion variant, lifecycle cleanup, and target-device test. An effect failing the review is simplified or removed.

### Gate 5 — Release verified
Build/tests pass; keyboard, touch, zoom, dark/light, reduced-motion, media failure, navigation/back, and form states are checked. Content and client claims are approved. Review actual performance with effects enabled.

## Suggested implementation sequence

1. Audit and create a difference report against the current Echo11 implementation.
2. Approve a minimal set of foundational token/component changes; avoid wholesale rewrites.
3. Finish core content and static responsive sections on Home, Work/case study, Services, and Contact.
4. Add local motion feedback, then at most one signature narrative effect at a time.
5. Improve `/lab` with a demonstrable experiment, explanation, accessibility fallback, and maintenance status.
6. Add secondary routes only when there is real content; test the whole experience.

## Maintenance protocol

For each document change: record version/date, affected route or token, evidence, reason, and test impact. If research changes, update the reference dossier first; if a shared decision changes, update foundation and then reconcile page/motion contracts. Keep source links in research and validated code paths in the audit log. Avoid copying this whole set into one giant agent prompt: give agents only the relevant approved foundation plus their route/effect contract.

## Success criterion

A contributor can answer: **What is already true? What is proposed? Who owns this decision? Where is it implemented? How do we test it?** If any answer is missing, the work is not ready for an unreviewed implementation.
