---
name: echo11-database
description: Use this skill when designing or modifying Echo11 data structures, Supabase usage, migrations, row-level security thinking, and schema decisions that support product workflows safely.
---

# Echo11 database skill

Use this skill for data-layer work in Echo11.

## Scope
Apply this skill when working on:
- Supabase schema design
- table changes
- migrations
- query patterns
- data access design
- RLS-aware planning
- relational modeling for portal or lab features

## Database foundation
Echo11 uses Supabase backed by PostgreSQL.

## Core principles
- Model data around real workflows, not only UI screens.
- Prefer clear relational structure over quick hacks.
- Think about ownership, visibility, and permissions early.
- Every schema change should be safe for future product growth.

## Migration rules
- Keep migrations inside `supabase/migrations/`.
- Make schema changes intentionally and traceably.
- Avoid manual undocumented changes that drift from migration history.
- Treat migration quality as part of product stability.

## Access design
- Assume RLS matters.
- Design tables with user role boundaries in mind.
- Be explicit about who can read, create, update, or delete records.
- Avoid broad access patterns that are convenient short-term but unsafe long-term.

## Query and model quality
- Use naming that stays understandable across frontend, backend, and business contexts.
- Avoid ambiguous status fields or overloaded generic columns.
- Prefer normalized structure where product relationships matter.
- Use denormalization only when justified by performance or workflow simplicity.

## Product thinking
Before changing schema, confirm:
- what business object this represents
- who owns it
- what lifecycle it has
- what related entities it depends on
- whether portal and lab need different visibility rules

## Safety checklist
- Does the schema match real product behavior?
- Will this be understandable 3 months later?
- Does RLS become easier or harder with this design?
- Is the migration path safe for existing data?
- Are naming and relationships obvious enough for future contributors?
