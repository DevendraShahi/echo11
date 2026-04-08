import { PageHeader } from '@/components/ui/PageHeader'
import { LabCard, LabCardContent, LabCardHeader, LabCardTitle } from '@/components/ui/LabCard'
import { CheckSquare, Briefcase, FileText, FileSignature, Folder, MessageSquare, BookOpen, Users, Settings, Calendar, LayoutDashboard } from 'lucide-react'

export const metadata = {
  title: 'Team Onboarding | echo11Lab',
  description: 'A complete guide to using every granular feature of the Echo11 Lab platform.',
}

export default function DocsPage() {
  return (
    <div className="space-y-16">
      
      {/* Intro */}
      <section>
        <PageHeader 
          title="Echo11 Lab Master Guide" 
          description="A complete and detailed overview of every feature available in your workspace."
        />
        <p className="mt-8 text-lg font-sans text-white/80 leading-relaxed border-l-4 border-accent pl-6">
          This system is your central nervous system. Using these features properly ensures our internal team and our clients always have a single source of truth.
        </p>
      </section>

      {/* 1. Dashboard */}
      <section id="dashboard" className="scroll-mt-12">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <LayoutDashboard className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold font-sans">1. Dashboard & Feed</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabCard>
            <LabCardHeader><LabCardTitle>Statistics & Charts</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Stats Cards:</strong> Quick numeric views of Active Projects, Tasks Completed, Monthly Revenue, and Upcoming Meetings.</li>
                <li><strong>Revenue Chart:</strong> 6-month line chart tracking financial trends.</li>
                <li><strong>Status Chart:</strong> Donut chart of project distributions (Active, Hold, Completed, Archived).</li>
              </ul>
            </LabCardContent>
          </LabCard>
          <LabCard>
            <LabCardHeader><LabCardTitle>Activity & Actions</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Activity Feed:</strong> A chronological live ledger of every action team members perform.</li>
                <li><strong>Quick Actions:</strong> Top-level buttons to instantly create a new Project, Task, Meeting, or Invoice.</li>
                <li><strong>Active Items:</strong> Lists the 5 most recently updated projects and any overdue tasks.</li>
              </ul>
            </LabCardContent>
          </LabCard>
        </div>
      </section>

      {/* 2. Clients & Teams */}
      <section id="clients" className="scroll-mt-12">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold font-sans">2. Clients & Teams</h2>
        </div>
        <div className="space-y-6">
          <LabCard>
            <LabCardHeader><LabCardTitle>Client Lifecycle & Portal</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Lifecycle Status:</strong> Track client journey using flags like Lead, Prospect, Active, At Risk, or Inactive.</li>
                <li><strong>Client Detail Tabbing:</strong> Every client has sub-tabs for Contacts, Projects, Invoices, Documents, and Activity history.</li>
                <li><strong>Portal Access:</strong> You can explicitly trigger &quot;Send Invitation&quot; to create auth accounts for clients to access their own portal.</li>
              </ul>
            </LabCardContent>
          </LabCard>
          <LabCard>
            <LabCardHeader><LabCardTitle>Team Hierarchy</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Roles:</strong> Assign members as &quot;Admin&quot; (sees and manages everything) or &quot;Member&quot; (sees their assigned scope).</li>
                <li><strong>Team Lead Access:</strong> Leaders can see all work underneath their designated team hierarchy.</li>
                <li><strong>Team Assignment:</strong> Organize staff into teams (e.g. Design Team, Dev Team) with distinctly assigned colors.</li>
              </ul>
            </LabCardContent>
          </LabCard>
        </div>
      </section>

      {/* 3. Projects & Milestones */}
      <section id="projects" className="scroll-mt-12">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <Briefcase className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold font-sans">3. Projects & Milestones</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabCard>
            <LabCardHeader><LabCardTitle>Project Board Output</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Grid vs List View:</strong> Toggle between visual cards or a compact table layout showing detailed budgets.</li>
                <li><strong>Status Filtering:</strong> Filter board by Active, On Hold, Completed, or Archived.</li>
                <li><strong>Project Categories:</strong> Categorize as Website, Mobile, Branding, Consulting, etc.</li>
              </ul>
            </LabCardContent>
          </LabCard>
          <LabCard>
            <LabCardHeader><LabCardTitle>Internal Tracking</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Tab Hierarchy:</strong> Every project houses internal tabs for its Tasks, Time Entries, Meetings, and Invoices.</li>
                <li><strong>Milestones:</strong> Break projects down. Completing milestones automatically calculates the numeric Progress bar.</li>
                <li><strong>Expenses:</strong> Auto-calculates your project Total Budget automatically when external expenses are logged.</li>
              </ul>
            </LabCardContent>
          </LabCard>
        </div>
      </section>

      {/* 4. Tasks & Meetings */}
      <section id="tasks" className="scroll-mt-12">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <CheckSquare className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold font-sans">4. Tasks & Meetings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabCard>
            <LabCardHeader><LabCardTitle>Tasks & Sorting</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Kanban Drag & Drop:</strong> Columns for To Do, In Progress, Review, and Done.</li>
                <li><strong>Priorities:</strong> Assign colors for Urgency (Gray: Low, Blue: Medium, Orange: High, Red: Urgent).</li>
                <li><strong>Task Detail Panel:</strong> Click a task to log time entries or attach physical files. Use <code>ESC</code> to quickly exit modals.</li>
              </ul>
            </LabCardContent>
          </LabCard>
          <LabCard>
            <LabCardHeader><LabCardTitle>Meeting Calendar</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Date Grouping:</strong> Organizes syncs perfectly into Today, Tomorrow, This Week, and Later headers.</li>
                <li><strong>Quick Joins:</strong> Stores Zoom/Meet links with a 1-click Join button.</li>
                <li><strong>Project Linking:</strong> Tie meetings directly into the historical log of a Client Project.</li>
              </ul>
            </LabCardContent>
          </LabCard>
        </div>
      </section>

      {/* 5. Invoices & Contracts */}
      <section id="invoices" className="scroll-mt-12">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <FileSignature className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold font-sans">5. Invoices & Contracts</h2>
        </div>
        <div className="space-y-6">
          <LabCard>
            <LabCardHeader><LabCardTitle>Invoicing Logic</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Status Workflow:</strong> Track invoices down the pipe: Draft → Sent → Paid (or Overdue / Cancelled).</li>
                <li><strong>PDF Exporting:</strong> Generates fully stylized PDF invoices from your line items.</li>
                <li><strong>Automated Math:</strong> Provide Quantity and Rates; the system handles sub-totals and fractional Tax percentages flawlessly.</li>
              </ul>
            </LabCardContent>
          </LabCard>
          <LabCard>
            <LabCardHeader><LabCardTitle>Contracts</LabCardTitle></LabCardHeader>
            <LabCardContent>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                <li><strong>Status Tracking:</strong> Track Legal scopes through Draft, Pending, Signed, Expired, or Terminated markers.</li>
                <li><strong>Financial Alignment:</strong> Stores monetary scope values alongside the uploaded documentation files.</li>
              </ul>
            </LabCardContent>
          </LabCard>
        </div>
      </section>

      {/* 6. Settings */}
      <section id="settings" className="scroll-mt-12 pt-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <Settings className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold font-sans">6. Settings & Profile</h2>
        </div>
        <LabCard>
          <LabCardContent className="pt-6">
            <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
              <li><strong>Profile Adjustments:</strong> Assign your personal Avatar, Name, and view your Team status.</li>
              <li><strong>Notification Toggles:</strong> Enable or disable specific email notifications like Task Reminders or Meeting alerts.</li>
              <li><strong>Appearance Toggles:</strong> Switch global layout themes between Dark mode (recommended), Light, or System syncing.</li>
            </ul>
          </LabCardContent>
        </LabCard>
      </section>

      <div className="pt-20 pb-10 flex items-center justify-center opacity-30">
        <div className="w-8 h-8 rounded-none bg-accent/20 flex items-center justify-center border border-accent">
          <BookOpen className="w-4 h-4 text-accent" />
        </div>
      </div>
    </div>
  )
}
