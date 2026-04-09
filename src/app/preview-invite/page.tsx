import { getTeamInviteEmailHtml, getInvoiceEmailHtml } from '@/lib/email'

export default function PreviewEmails() {
  const teamInviteHtml = getTeamInviteEmailHtml(
    'founder@echo11.tech', 
    'member', 
    'https://echo11.tech/lab/auth/team-signup?invite=demo-1234',
    'Senior Developer'
  )

  const invoiceHtml = getInvoiceEmailHtml(
    'Acme Corp',
    'INV-2026-001',
    'April 30, 2026',
    '$14,500.00'
  )

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
          <div>
            <h1 className="font-bold text-xl text-cyan-400">Email Templates Preview Mode</h1>
            <p className="text-white/50 text-sm mt-1">Live previewing: <code className="text-white bg-black px-2 py-1 rounded">src/lib/email.ts</code></p>
          </div>
          <div className="text-xs text-white/40 max-w-xs text-right">
            Edit the HTML strings inside the email helper and these viewports will hot-reload instantly.
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h2 className="text-sm font-mono text-white/50 uppercase tracking-wider pl-1">Team Invite Template</h2>
            <div className="rounded-xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <iframe 
                srcDoc={teamInviteHtml} 
                className="w-full h-[800px] bg-white pointer-events-none" 
                title="Team Invite Preview"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-mono text-white/50 uppercase tracking-wider pl-1">Automated Invoice Template</h2>
            <div className="rounded-xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <iframe 
                srcDoc={invoiceHtml} 
                className="w-full h-[800px] bg-white pointer-events-none" 
                title="Invoice Email Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
