---
name: echo11-backend
description: Use this skill when implementing backend logic for Echo11, including server actions, auth-aware flows, integrations, email behavior, and application logic that supports the marketing, portal, and lab surfaces.
---

# Echo11 backend skill

Use this skill for backend-oriented work in Echo11.

## Scope
Apply this skill when working on:
- server actions
- auth-aware flows
- secure data operations
- email-related logic with Resend
- business logic for portal or lab features
- integration behavior tied to Supabase-backed data

## Backend philosophy
Echo11 backend work should be:
- predictable
- type-safe
- auth-aware
- easy to reason about
- aligned with real product workflows

## Main backend rules
- Keep logic close to the product purpose.
- Prefer clear data flow over clever abstraction.
- Make user roles and access assumptions explicit.
- Keep server logic safe for future product scaling.

## Auth and access
- Echo11 uses Supabase Auth.
- Treat auth as part of architecture, not a later patch.
- Always consider whether an action belongs to public, portal, or lab scope.
- Avoid mixing privileged and user-facing logic casually.

## Server actions and logic
- Use structured success/error responses where practical.
- Handle async operations with try/catch.
- Log errors with enough context for debugging.
- Do not leak internal failure details into user-facing copy.

## Integrations
- Resend is used for email.
- External integrations should remain isolated and explicit.
- Environment-variable dependency should always be clear.

## Product alignment
For each backend feature, confirm:
- who triggers it
- what business event it represents
- what data changes it performs
- what auth context is required
- what the failure mode should look like

## Maintainability
- Prefer explicitness over hidden magic.
- Keep file organization aligned with existing repo patterns.
- Avoid backend changes that force accidental frontend redesign.
- Think in workflows, not only endpoints.
