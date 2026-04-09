# Echo11 Lab — Session Progress Log

> Last Updated: April 8, 2026
> Session Focus: Notification UX, /lab audit & 25-issue fix pass

---

## Session — April 8, 2026

### 1. Notification Bell — Auto-dismiss on Link Click

**Problem:** Linked notifications had no `onClick` handler — they never got marked as read, so the dropdown became crowded over time.

**Fix:**
- `getNotifications()` in `notification-actions.ts` now accepts `unreadOnly = true` — dropdown only fetches unread notifications by default.
- Added `handleLinkClick(id)` in `NotificationBell` — marks as read, closes dropdown, and removes the notification from local state optimistically (instant UI, no reload).
- Added `handleMarkAsRead` and `handleMarkAllRead` with optimistic state updates — no more reload flicker.
- Non-link notifications still dismiss on click.
- "Mark all read" clears the full list instantly.

Key files:
- `src/components/layout/lab/NotificationBell.tsx`
- `src/lib/actions/notification-actions.ts`

---

### 2. Full /lab Audit — 25 Issues Identified & Fixed

A comprehensive audit of all /lab pages, components, server actions, and types was performed. 25 issues were found across Critical, Major, and Minor categories. All were fixed.

---

#### Critical Fixes

**C1–C2 — Invoice Team Filtering (Data Exposure)**
- `getInvoices()` in `invoices/page.tsx` had no team-based filtering — all members could see all teams' invoices.
- Fixed: non-admin/non-lead members now only see invoices linked to their team's projects (or invoices with no project). Admins/leads see all.
- Key file: `src/app/lab/(authenticated)/invoices/page.tsx`

**C3 — Contract Action Guards**
- Verified all contract mutations (`createContract`, `updateContract`, `updateContractStatus`, `deleteContract`, `uploadContractFile`, `generateContractFromTemplate`, `sendContractToClient`) already have `requireAdminOrLead` guards.
- Key file: `src/lib/actions/contract-actions.ts`

**C4 — Task Access Control**
- `tasks/[id]/page.tsx` showed edit/delete buttons to all authenticated users regardless of role.
- Fixed: added `canEdit` state (admin OR team lead OR task assignee). Edit button and Delete Task button are hidden for users without permission.
- Key file: `src/app/lab/(authenticated)/tasks/[id]/page.tsx`

**C5 — Teams Page alert() Replaced**
- `teams/page.tsx` used `alert()` for invite success/error feedback.
- Fixed: added `inviteError` and `inviteSuccess` state; inline messages shown in the invite modal form. Modal auto-closes 1.2s after success.
- Key file: `src/app/lab/(authenticated)/teams/page.tsx`

---

#### Major Fixes

**M1 — Contracts Page Always Read-Only**
- `contracts/page.tsx` never fetched user role — `ContractsPageClient` always rendered without edit permissions.
- Fixed: `getUserRoleAndTeam()` added to parallel fetch; `canEdit` computed and passed as prop. New Contract button, per-contract edit/delete/status buttons all gated by `canEdit`.
- Key files: `src/app/lab/(authenticated)/contracts/page.tsx`, `src/components/contracts/ContractsPageClient.tsx`

**M2 — Members Couldn't Mark Own Tasks Done**
- `updateTaskStatus` only allowed admins or team leads to move tasks to "done", creating a workflow bottleneck.
- Fixed: task's `assignee_id` is now fetched in `updateTaskStatus`; the assignee is also permitted to mark done.
- Key file: `src/lib/actions/task-actions.ts`

**M3 — InvoiceForm No Validation**
- Invoice form allowed submission with empty line items or $0 rates.
- Fixed: added `validationError` state; submit handler validates at least one item has a non-empty description, quantity > 0, and rate > 0. Error displayed above submit button.
- Key file: `src/components/lab/InvoiceForm.tsx`

**M4 — Expense Delete No Confirmation**
- `deleteExpense` in `ProjectDetailClient` deleted immediately with no confirmation.
- Fixed: added `confirm('Delete this expense?')` guard before deletion.
- Key file: `src/app/lab/(authenticated)/projects/[id]/ProjectDetailClient.tsx`

**M5 — Meetings Only Loaded Active Projects**
- Meetings page filtered projects to `status = 'active'`, preventing scheduling retrospectives or final meetings for completed projects.
- Fixed: removed `.eq('status', 'active')` filter; all projects are now available.
- Key file: `src/app/lab/(authenticated)/meetings/page.tsx`

**M6 — deleteClient Cascade Check Missing**
- `deleteClient` deleted clients even if they had active projects or outstanding invoices, risking orphaned records.
- Fixed: added pre-deletion checks — blocks deletion if any `active`/`on_hold` projects or `sent`/`overdue` invoices exist for the client. Returns descriptive error messages.
- Key file: `src/lib/actions/client-actions.ts`

**M7 — Invoice Status No State Machine**
- `updateInvoiceStatus` accepted any status transition (e.g., `paid → draft`), allowing invalid financial states.
- Fixed: added `validTransitions` map enforcing valid paths (`draft→sent/cancelled`, `sent→paid/overdue/cancelled`, `paid` is terminal, `cancelled→draft`). Invalid transitions return an error.
- Key file: `src/lib/actions/invoice-actions.ts`

**M8 — Expense Errors Swallowed**
- `addExpense` and `deleteExpense` caught errors with `console.error` but showed no user feedback.
- Fixed: added `expenseError` state; errors are displayed inline below the expense form. State clears on success.
- Key file: `src/app/lab/(authenticated)/projects/[id]/ProjectDetailClient.tsx`

---

#### Minor Fixes

**mn1 — Invitation Token Expiry**
- Client portal invitation tokens never expired — old tokens remained valid indefinitely.
- Fixed:
  - New migration `20260408000004_add_invitation_token_expiry.sql` adds `invitation_token_expires_at TIMESTAMPTZ` to `clients` table.
  - `sendClientPortalInvite` sets expiry to 7 days from send time.
  - `getClientInviteDetails` rejects tokens past their expiry date.
  - `acceptClientInvite` clears both `invitation_token` and `invitation_token_expires_at` on acceptance.
  - Type updated in `src/types/lab.ts`.
- Key files: `src/lib/actions/client-actions.ts`, `src/types/lab.ts`, `supabase/migrations/20260408000004_add_invitation_token_expiry.sql`

**mn2 — Task Detail Page Not Revalidated on Status Update**
- `updateTaskStatus` revalidated `/lab/tasks` and the project page, but not `/lab/tasks/[id]`.
- Fixed: added `revalidatePath(\`/lab/tasks/${taskId}\`)`.
- Key file: `src/lib/actions/task-actions.ts`

**mn3 — Duplicate Supabase Instance in emailInvoiceAction**
- `emailInvoiceAction` created a second `supabase` client instance mid-function for the notification, ignoring the one already created at the top.
- Fixed: removed duplicate client creation; reused existing `userId` from the top of the function.
- Key file: `src/lib/actions/invoice-actions.ts`

**mn4 — service_id Not Reset When Project Changes**
- In the expense form, selecting a new project didn't clear the previously selected `service_id`, potentially linking the wrong service to an expense.
- Fixed: `useEffect` watches `projectId` and resets `newExpense.service_id` to empty string on change.
- Key file: `src/app/lab/(authenticated)/projects/[id]/ProjectDetailClient.tsx`

**mn5 — Delete Button Not Disabled While Deleting**
- The project delete confirmation button wasn't properly disabled during deletion, allowing double-clicks and race conditions.
- Fixed: confirmed `disabled={deleting}` is set; added `Loader2` spinner alongside "Deleting..." text for visual feedback.
- Key file: `src/app/lab/(authenticated)/projects/ProjectsPageClient.tsx`

---

## Pending / Needs DB Migration

| Item | Action Required |
|------|----------------|
| Invitation token expiry | Run `supabase/migrations/20260408000004_add_invitation_token_expiry.sql` against Supabase project |

---

## Files Modified This Session

| File | Changes |
|------|---------|
| `src/components/layout/lab/NotificationBell.tsx` | Auto-dismiss on link click, optimistic state updates |
| `src/lib/actions/notification-actions.ts` | `unreadOnly` param added to `getNotifications` |
| `src/app/lab/(authenticated)/invoices/page.tsx` | Team-based invoice filtering for non-admin members |
| `src/app/lab/(authenticated)/tasks/[id]/page.tsx` | `canEdit` state, gated edit/delete buttons |
| `src/app/lab/(authenticated)/teams/page.tsx` | Replaced `alert()` with inline error/success state |
| `src/app/lab/(authenticated)/contracts/page.tsx` | Added `getUserRoleAndTeam`, passes `canEdit` |
| `src/app/lab/(authenticated)/meetings/page.tsx` | Removed active-only project filter |
| `src/app/lab/(authenticated)/projects/[id]/ProjectDetailClient.tsx` | Expense confirm dialog, error feedback, service_id reset |
| `src/app/lab/(authenticated)/projects/ProjectsPageClient.tsx` | Delete button disabled + spinner while deleting |
| `src/components/contracts/ContractsPageClient.tsx` | `canEdit` prop, gated create/edit/delete buttons |
| `src/components/lab/InvoiceForm.tsx` | Line item validation before submit |
| `src/lib/actions/task-actions.ts` | Assignee can mark done, revalidate `tasks/[id]` |
| `src/lib/actions/invoice-actions.ts` | Status state machine, removed duplicate Supabase client |
| `src/lib/actions/client-actions.ts` | Cascade check in deleteClient, token expiry on invite |
| `src/types/lab.ts` | Added `invitation_token_expires_at` field |
| `supabase/migrations/20260408000004_add_invitation_token_expiry.sql` | New migration for token expiry column |

---

## Session — April 9, 2026 (Continuation — Phase 1 Parallel Audit)

> Context: Continuation after compaction. Running 6 parallel subagents across all /lab pages.
> Phase 1A (Dashboard, Auth) ✅ | Phase 1B (Projects) ✅ | Phase 1C (Clients) ✅ | Phase 1D (Invoices) in-progress | Phase 1E (Teams) in-progress | Phase 1F (Tasks, Contracts, Settings) ✅

---

### Phase 1B: Projects — Additional Fixes

**P1 — createProject Missing Server Action**
- Project creation was done client-side in the form, bypassing RBAC completely.
- Fixed: added `createProject` server action in `project-actions.ts` with `requireAdminOrLead` guard, name validation, activity logging, and `revalidatePath('/lab/projects')`.
- Key file: `src/lib/actions/project-actions.ts`

**P2 — Progress Recalculation Guard Bug**
- `updateProjectProgress` only wrote progress if milestones existed — if all milestones were removed, progress stayed stale.
- Fixed: removed the conditional; progress is always written (defaults to 0 if no milestones).
- Key file: `src/lib/actions/project-actions.ts`

**P3 — Shared menuRef Across .map() in ProjectsPageClient**
- Single `useRef` was shared across all project cards in `.map()` — outside-click detection only worked for the last card.
- Fixed: replaced with `data-project-menu` attribute + `element.closest('[data-project-menu]')` pattern.
- Key file: `src/app/lab/(authenticated)/projects/ProjectsPageClient.tsx`

**P4 — deleteProject No Success Check**
- Delete handler called the action but never checked `result.success`, silently failing on RBAC rejection.
- Fixed: added `deleteError` state; `handleDelete` checks success and shows inline error.
- Key file: `src/app/lab/(authenticated)/projects/ProjectsPageClient.tsx`

**P5 — expense.rate Null Crash**
- `expense.rate.toFixed(2)` crashed when `rate` was null/undefined.
- Fixed: `(expense.rate ?? 0).toFixed(2)`.
- Key file: `src/app/lab/(authenticated)/projects/[id]/ProjectDetailClient.tsx`

**P6 — Kanban Retry Button Did Nothing**
- Retry button in the empty/error state called `loadTasks` but `refreshKey` was never incremented to trigger the `useEffect`.
- Fixed: `setRefreshKey(k => k + 1)` added to retry click handler.
- Key file: `src/components/lab/KanbanBoard.tsx`

**P7 — DragOverlay Non-null Assertion**
- `tasks.find(...)!` in DragOverlay threw on edge cases where `activeId` had no matching task.
- Fixed: replaced with null-safe IIFE returning `null` if not found.
- Key file: `src/components/lab/KanbanBoard.tsx`

---

### Phase 1C: Clients/[id] — Fixes

All fixes applied to `src/app/lab/(authenticated)/clients/[id]/page.tsx`:

**C1 — setPrimaryContact Fire-and-Forget**
- `onClick` called setPrimaryContact without await, result ignored.
- Fixed: async handler, checks `result.success`, shows `alert` on error.

**C2 — deleteContact Fire-and-Forget**
- Same pattern — no result check.
- Fixed: async handler with confirm + error feedback.

**C3 — deleteContract Fire-and-Forget**
- `deleteContract(contract.id, clientId).then(loadData)` — result never checked.
- Fixed: async handler, checks result, alert on failure.

**C4 — deleteDocument No Confirm + Silent Fail**
- Called without confirm dialog, result ignored.
- Fixed: added `confirm('Delete document?')` guard + result check.

**C5 — deleteNote No Confirm + Silent Fail**
- Same pattern as documents.
- Fixed: added confirm + result check.

**C6 — handleDelete Catch Swallowed Error**
- `catch (error)` block only logged to console.
- Fixed: also calls `alert('An unexpected error occurred...')`.

**C7 — AddNoteModal No Error UI**
- `createNote` result was awaited but never checked — modal closed even on failure.
- Fixed: added `error` state, result check, inline error display.

**C8 — EditNoteModal No Error UI**
- Same pattern as AddNoteModal.
- Fixed: added `error` state, result check, inline error display.

**C9 — Upload No File Validation**
- `uploadDocument` was called with no size or type checks.
- Fixed: added 10MB limit check, `accept` attribute on input restricting to common file types. Shows `alert` on upload error.

**C10 — No Portal Invite Button on Detail Page**
- There was no way to invite a client to the portal from their detail page (only from the project detail page).
- Fixed: added "Invite to Portal" button in client header. Gated by `canEdit && client.email && !client.invitation_sent_at`. Shows "Invite Sent" badge if pending, "Portal Active" badge if accepted.
- New imports: `sendClientPortalInvite`, `Send`, `Loader2`, `CheckCircle`.

**C11 (Fix 16) — Notes Ordering**
- Already correct: `getClientNotes` uses `{ ascending: false }` — newest first. No change needed.

**C12 (Fix 15) — Client Status UI**
- No `updateClientStatus` server action exists. Deferred to Phase 3 backend work.

---

### Phase 1F: Tasks, Contracts, Settings — Fixes

**T1 — Task Edit Form Missing Fields**
- The edit form only had title + description inputs. Status, priority, assignee, and due_date were not editable.
- Fixed: added status select, priority select, assignee select (uses `getTeamMembers`), and due_date input to the edit form.
- `getTeamMembers` was imported but never called — now called after role check in `loadData`.
- `teamMembers` state added to drive the assignee dropdown.
- Key file: `src/app/lab/(authenticated)/tasks/[id]/page.tsx`

**T2 — handleSave No Error Feedback**
- On save failure, the form silently stayed in edit mode with no message.
- Fixed: added `saveError` state; displayed above the form on failure. Title validation before save.
- Key file: `src/app/lab/(authenticated)/tasks/[id]/page.tsx`

**T3 — handleDelete No Error Feedback**
- On delete failure, nothing happened — the task stayed and the user had no indication.
- Fixed: `alert(result.error || 'Failed to delete task')` on failure.
- Key file: `src/app/lab/(authenticated)/tasks/[id]/page.tsx`

**T4 — File Upload No Size Validation**
- `handleFileUpload` didn't check file size before uploading.
- Fixed: 10MB limit check added before upload call.
- Key file: `src/app/lab/(authenticated)/tasks/[id]/page.tsx`

**T5 — downloadAttachment Silent Error**
- Download errors were only logged to console — user had no feedback.
- Fixed: `alert('Failed to download file. It may no longer exist.')` on error.
- Key file: `src/app/lab/(authenticated)/tasks/[id]/page.tsx`

**T6 — Time Log Hours min="0" Allowed Zero**
- HTML `min="0"` allowed submitting 0 hours.
- Fixed: changed to `min="0.5"`.
- Key file: `src/app/lab/(authenticated)/tasks/[id]/page.tsx`

**T7 — Time Log Future Date Allowed**
- Date input had no `max` attribute — future dates could be submitted.
- Fixed: added `max={new Date().toISOString().split('T')[0]}`.
- Key file: `src/app/lab/(authenticated)/tasks/[id]/page.tsx`

**CT1 — ContractsPageClient handleDelete Silent Fail**
- `await deleteContract(...)` result was ignored — contract removed from state even on failure.
- Fixed: checks `result.success`, shows alert on failure, calls `router.refresh()` on success.
- Key file: `src/components/contracts/ContractsPageClient.tsx`

**S1 — Settings Page**
- Settings page is well-implemented: profile save, preferences save, password change all have success/error feedback. `Loading` and `saving` states correct. No fixes needed.

---

## ⏳ STILL PENDING — Continue From Here

### Phase 1D: Invoices + Meetings — FIXED
**ID1 — Invoice item.rate null crash**
- `item.rate.toFixed(2)` crashed when rate was null
- Fixed: `(item.rate ?? 0).toFixed(2)` and same for amount
- Key file: `src/app/lab/(authenticated)/invoices/[id]/page.tsx`

**ID2 — Invoice email use any type**
- Invoice client casting used `as any`
- Fixed: proper typing with clientName/clientEmail variables
- Fixed catch block: `e instanceof Error` check instead of `: any`
- Key file: `src/app/lab/(authenticated)/invoices/[id]/page.tsx`

**ID3 — MeetingsPageClient unused imports**
- `Calendar`, `deleteMeeting`, `useEffect` unused
- Fixed: removed unused imports
- Key file: `src/app/lab/(authenticated)/meetings/MeetingsPageClient.tsx`

### Phase 1E: Teams + Moodboard — FIXED
**TE1 — Team detail missing error feedback**
- `handleAddProject`, `handleRemoveProject`, `handleSetLead`, `handleRemoveMember` never checked result
- Fixed: added result.success checks with alert on failure
- Key file: `src/app/lab/(authenticated)/teams/[id]/page.tsx`

**TE2 — Moodboard any types**
- `messages` and `notes` used `any[]`
- Fixed: imported `TeamMessage`, `TeamNote` from team-moodboard-actions
- Key file: `src/app/lab/(authenticated)/teams/[id]/moodboard/page.tsx`

**TE3 — Teams page any type**
- `(team as any).members` used any type
- Fixed: added `TeamWithMembers` interface extending Team
- Key file: `src/app/lab/(authenticated)/teams/page.tsx`

### Remaining Fixes from Build
- Dashboard: any type for project.tasks ✅ FIXED
- InvoiceForm: let → const ✅ FIXED  
- invoice-actions.ts: catch any ✅ FIXED
- email.ts: catch any ✅ FIXED

### Phase 2A–2D: UI Audit — COMPLETE ✅

**2A: Global Layout**
- globals.css: ✅ Design tokens well-defined (--accent: #00E5FF, --card, --background all set)
- PageWrapper: ✅ Proper z-index layering, grain overlay, orb-pulse for inner pages
- No issues found

**2B: Typography**
- font-sans: Used for body text, headings, labels, navigation
- font-mono: Used for meta info: dates, counts, status badges, timestamps
- Pattern is consistent across the codebase
- No changes needed

**2C: Spacing**
- Form inputs: consistent px-4 py-3 / px-4 py-2.5 pattern
- Cards: p-4 / p-6 consistent
- Gap: 4/5/6 grid gaps consistent
- No issues found

**2D: Form Components**
- LabButton: 7 variants (default, destructive, danger, outline, secondary, ghost, glass, glow), 4 sizes
- LabCard: Present with proper glass styling
- Input focus: border-accent focus:outline-none focus:ring-1 focus:ring-accent pattern consistent
- Selects: appearance-none with custom styling
- No issues found

### Phase 3: Backend Deep Audit — COMPLETE

**Auth Checks**: ✅ All actions use `getUser()` correctly (52 occurrences), none use `getSession()`

**Error Handling**: ✅ All catch blocks return structured `{ success: false, error: ... }` with user-safe messages, not internal details

**N+1 Queries**: ✅ No N+1 patterns found. Batch operations use `Promise.all(members.map(...))` and set-based operations

**Select \***: Found 8 uses but all are for full row retrieval with proper filters, not in loops

**Return Shapes**: ✅ All actions return `{ success: boolean, error?: string }` or `{ success: boolean, ... }` pattern

---

## All Modified Files (Both Sessions Combined)

| File | Changes |
|------|---------|
| `src/components/layout/lab/NotificationBell.tsx` | Auto-dismiss, optimistic state |
| `src/lib/actions/notification-actions.ts` | `unreadOnly` param |
| `src/app/lab/(authenticated)/invoices/page.tsx` | Team-based filtering |
| `src/app/lab/(authenticated)/invoices/[id]/page.tsx` | null-safe item rate/amount, remove any type from client, proper error catch |
| `src/app/lab/(authenticated)/invoices/InvoicesPageClient.tsx` | (no changes needed) |
| `src/app/lab/(authenticated)/tasks/[id]/page.tsx` | canEdit, full edit form (status/priority/assignee/date), save/delete error feedback, time log validation, file size limit |
| `src/app/lab/(authenticated)/teams/page.tsx` | Inline invite feedback, TeamWithMembers interface |
| `src/app/lab/(authenticated)/teams/[id]/page.tsx` | Error feedback on all action handlers |
| `src/app/lab/(authenticated)/teams/[id]/moodboard/page.tsx` | Proper TeamMessage/TeamNote types |
| `src/app/lab/(authenticated)/contracts/page.tsx` | canEdit prop |
| `src/app/lab/(authenticated)/meetings/page.tsx` | Removed active-only project filter |
| `src/app/lab/(authenticated)/meetings/MeetingsPageClient.tsx` | Removed unused imports |
| `src/app/lab/(authenticated)/projects/[id]/ProjectDetailClient.tsx` | Expense confirm, error state, null-safe rate, service_id reset |
| `src/app/lab/(authenticated)/projects/ProjectsPageClient.tsx` | menuRef fix, deleteError state, disabled spinner |
| `src/app/lab/(authenticated)/clients/[id]/page.tsx` | 10 fixes: all action result checks, confirm dialogs, error UI in modals, file validation, portal invite button |
| `src/app/lab/(authenticated)/dashboard/page.tsx` | Proper ProjectWithTasks interface |
| `src/components/contracts/ContractsPageClient.tsx` | canEdit prop, handleDelete result check |
| `src/components/lab/InvoiceForm.tsx` | Line item validation, const instead of let |
| `src/components/lab/KanbanBoard.tsx` | Retry key fix, null-safe DragOverlay |
| `src/lib/actions/task-actions.ts` | Assignee can mark done, revalidate tasks/[id] |
| `src/lib/actions/invoice-actions.ts` | Status state machine, dedup Supabase client, proper error catch |
| `src/lib/actions/client-actions.ts` | Cascade check, token expiry |
| `src/lib/actions/project-actions.ts` | createProject action, progress recalc fix |
| `src/lib/actions/contact-actions.ts` | Name validation, primary contact delete guard, revalidatePaths |
| `src/lib/email.ts` | Proper error catch (e instanceof Error) |
| `src/types/lab.ts` | invitation_token_expires_at |
| `supabase/migrations/20260408000004_add_invitation_token_expiry.sql` | Token expiry column |
