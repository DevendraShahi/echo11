# Lab Frontend Overview

## Route Structure
- `/lab` -> Redirects to dashboard
- `/lab/(auth)` -> Unauthenticated routes (`login`, `signup`, `team-signup`)
- `/lab/(authenticated)` -> Authenticated routes (`dashboard`, `clients`, `projects`, `tasks`, `invoices`, `contracts`, `meetings`, `teams`, `settings`)

## Core Concepts
- **Layouts**: 
  - Root layout applies `Cursor`, `Navbar`, `Footer` globally.
  - Auth layout checks `supabase.auth.getUser()` and redirects to dashboard if logged in.
  - Authenticated layout enforces session, sets user preferences (theme), and loads `LabSidebar` and `LabHeader`.
- **Data Flow**: Server components fetch initial data and pass them to client components (e.g., `ProjectsPageClient`).
- **Server Actions**: Used exclusively for mutations and data fetching. All actions return `{ success: boolean, error?: string, data?: T }`.

> Note: The full historical breakdown of every component, file, and state variable has been archived in `docs/archive/lab-frontend-full.md`.
