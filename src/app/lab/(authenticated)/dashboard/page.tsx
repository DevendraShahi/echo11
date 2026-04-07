import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'
import { 
  FolderKanban, 
  CheckSquare, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react'
import { StatCard, RevenueChart, ProjectStatusChart, QuickActions, ActiveProjects, OverdueTasks, DateRangePicker } from '@/components/dashboard'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { ProjectStatus } from '@/types/lab'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { dashboardTourSteps } from '@/components/onboarding/pageTours'

async function getStats() {
  const supabase = await createClient()
  
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30).toISOString()
  const sixtyDaysAgo = subDays(now, 60).toISOString()

  const [projectsResult, tasksResult, invoicesResult, meetingsResult, recentInvoices, prevInvoices] = await Promise.all([
    supabase.from('projects').select('id,status', { count: 'exact' }),
    supabase.from('tasks').select('id,status,due_date', { count: 'exact' }),
    supabase.from('invoices').select('total,status,created_at', { count: 'exact' }),
    supabase.from('meetings').select('id,scheduled_at').gte('scheduled_at', now.toISOString()),
    supabase.from('invoices').select('total,status,created_at').gte('created_at', thirtyDaysAgo).eq('status', 'paid'),
    supabase.from('invoices').select('total,status,created_at').gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo).eq('status', 'paid')
  ])

  const activeProjects = projectsResult.data?.filter(p => p.status === 'active').length || 0
  const totalProjects = projectsResult.count || 0
  const completedTasks = tasksResult.data?.filter(t => t.status === 'done').length || 0
  const totalTasks = tasksResult.count || 0
  const totalRevenue = invoicesResult.data?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0) || 0
  const monthlyRevenue = recentInvoices.data?.reduce((sum, i) => sum + (i.total || 0), 0) || 0
  const prevRevenue = prevInvoices.data?.reduce((sum, i) => sum + (i.total || 0), 0) || 0
  const upcomingMeetings = meetingsResult.count || 0

  const overdueTasks = tasksResult.data?.filter(t => {
    if (!t.due_date || t.status === 'done') return false
    return new Date(t.due_date) < now
  }).length || 0

  const revenueTrend = prevRevenue > 0 ? Math.round(((monthlyRevenue - prevRevenue) / prevRevenue) * 100) : 0

  return {
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    totalRevenue,
    monthlyRevenue,
    upcomingMeetings,
    overdueTasks,
    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    trends: {
      projects: totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0,
      tasks: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      revenue: revenueTrend,
      meetings: upcomingMeetings
    }
  }
}

async function getRecentActivities() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activities')
    .select('*, user:profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(8)
  
  return data || []
}

async function getUpcomingMeetings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('meetings')
    .select('*, project:projects(name)')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)
  
  return data || []
}

async function getActiveProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, client:clients(company_name)')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(5)
  
  return data || []
}

async function getOverdueTasks() {
  const supabase = await createClient()
  const now = new Date().toISOString()
  
  const { data } = await supabase
    .from('tasks')
    .select('*, project:projects(name)')
    .lt('due_date', now)
    .neq('status', 'done')
    .order('due_date', { ascending: true })
    .limit(5)
  
  return data || []
}

async function getRevenueData() {
  const supabase = await createClient()
  const now = new Date()

  // Build 6-month window bounds
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const windowEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const { data } = await supabase
    .from('invoices')
    .select('total, paid_date')
    .eq('status', 'paid')
    .gte('paid_date', windowStart.toISOString())
    .lte('paid_date', windowEnd.toISOString())

  // Aggregate into per-month buckets
  const buckets: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets[format(d, 'MMM yyyy')] = 0
  }

  for (const inv of data || []) {
    if (!inv.paid_date) continue
    const key = format(new Date(inv.paid_date), 'MMM yyyy')
    if (key in buckets) buckets[key] += inv.total || 0
  }

  return Object.entries(buckets).map(([month, revenue]) => ({ month, revenue }))
}

async function getProjectStatusData() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('status')
  
  const statusCounts = data?.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}
  
  return [
    { status: 'active' as ProjectStatus, count: statusCounts.active || 0 },
    { status: 'on_hold' as ProjectStatus, count: statusCounts.on_hold || 0 },
    { status: 'completed' as ProjectStatus, count: statusCounts.completed || 0 },
    { status: 'archived' as ProjectStatus, count: statusCounts.archived || 0 },
  ]
}

export default async function DashboardPage() {
  const [stats, activities, meetings, activeProjects, overdueTasks, revenueData, projectStatusData] = await Promise.all([
    getStats(),
    getRecentActivities(),
    getUpcomingMeetings(),
    getActiveProjects(),
    getOverdueTasks(),
    getRevenueData(),
    getProjectStatusData()
  ])

  const statCards = [
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      subtitle: stats.totalProjects,
      icon: <FolderKanban className="w-6 h-6" />,
      color: 'indigo' as const,
      trend: { value: stats.trends.projects, isPositive: stats.trends.projects > 50, label: 'of total' },
    },
    {
      title: 'Tasks Completed',
      value: stats.completedTasks,
      subtitle: stats.totalTasks,
      icon: <CheckSquare className="w-6 h-6" />,
      color: 'emerald' as const,
      trend: { value: stats.taskCompletionRate, isPositive: stats.taskCompletionRate > 50, label: 'completion' },
    },
    {
      title: 'Revenue (Monthly)',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'amber' as const,
      trend: { value: Math.abs(stats.trends.revenue), isPositive: stats.trends.revenue >= 0, label: 'vs last period' },
    },
    {
      title: 'Upcoming Meetings',
      value: stats.upcomingMeetings,
      icon: <Calendar className="w-6 h-6" />,
      color: 'rose' as const,
      trend: { value: 0, isPositive: true, label: 'next 7 days' },
    },
  ]

  return (
    <div className="space-y-6 font-sans">
      <TooltipTour steps={dashboardTourSteps} pageId="dashboard" />
      <PageVisitTracker pageId="dashboard" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">Dashboard</h1>
          <p className="text-white/50 font-sans">Welcome back! Here&apos;s what&apos;s happening with your projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker />
          <p className="text-sm text-white/50 font-mono">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stats-cards">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            trend={stat.trend}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div data-tour="quick-actions">
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-tour="revenue-chart">
          <RevenueChart data={revenueData} />
        </div>
        <div data-tour="project-status">
          <ProjectStatusChart data={projectStatusData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-tour="active-projects">
          <ActiveProjects projects={activeProjects} />
        </div>
        <div data-tour="overdue-tasks">
          <OverdueTasks tasks={overdueTasks} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LabCard data-tour="recent-activity">
          <LabCardHeader className="flex flex-row items-center justify-between pb-2">
            <LabCardTitle className="text-lg font-semibold">Recent Activity</LabCardTitle>
          </LabCardHeader>
          <LabCardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start working on projects to see activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-none flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-white/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{(activity.user as { full_name?: string })?.full_name || 'Someone'}</span>
                        {' '}{activity.action}
                      </p>
                      <p className="text-xs text-white/40">
                        {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </LabCardContent>
        </LabCard>

        <LabCard data-tour="upcoming-meetings">
          <LabCardHeader className="flex flex-row items-center justify-between pb-2">
            <LabCardTitle className="text-lg font-semibold">Upcoming Meetings</LabCardTitle>
          </LabCardHeader>
          <LabCardContent>
            {meetings.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming meetings</p>
                <p className="text-sm">Schedule a meeting to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-start gap-3 p-3 rounded-none bg-white/5">
                    <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-none flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-accent">
                        {format(new Date(meeting.scheduled_at), 'd')}
                      </span>
                      <span className="text-[10px] text-accent/70 uppercase">
                        {format(new Date(meeting.scheduled_at), 'MMM')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{meeting.title}</p>
                      <p className="text-sm text-white/50">
                        {format(new Date(meeting.scheduled_at), 'h:mm a')} • {meeting.duration_minutes} min
                      </p>
                      {meeting.project && (
                        <p className="text-xs text-white/40 mt-1">
                          {(meeting.project as { name: string }).name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </LabCardContent>
        </LabCard>
      </div>
    </div>
  )
}
