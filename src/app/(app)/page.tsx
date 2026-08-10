import { getDashboardSummary } from '@/app/actions/dashboard'
import { SemanticSearchBox } from '@/components/semantic-search/semantic-search-box'
import { Calendar, Building2, ChevronRight, CheckCircle2, ArrowUpRight, Search, Clock, Plus, BarChart3, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CompanyPipelineActions } from '@/components/forms/company-pipeline-actions'
import { formatDistanceToNow, format } from 'date-fns'
import { LiveRefresh } from '@/components/live-refresh'
import { DashboardPipelineFilters } from '@/components/dashboard-pipeline-filters'
import { getTeamMembers } from '@/app/actions/companies'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string; owner?: string }> }) {
  const filters = await searchParams
  const [summaryResponse, teamResponse] = await Promise.all([getDashboardSummary({ status: filters.status, ownerId: filters.owner }), getTeamMembers()])
  let summary: any = { pipeline: [], regularFollowUps: [], teamWorkload: [] }
  
  if (summaryResponse.success) {
    summary = summaryResponse.data
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

  // Helper for status styling
  const getStatusStyle = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'prospect': return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'contacted': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'discussion': return 'bg-indigo-100 text-indigo-600 border-indigo-200'
      case 'proposal': return 'bg-purple-100 text-purple-600 border-purple-200'
      case 'negotiation': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
      case 'partnership signed': 
      case 'active partner': return 'bg-emerald-100 text-emerald-600 border-emerald-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusDot = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'negotiation': return 'bg-[#F59E0B]'
      case 'active partner': return 'bg-emerald-500'
      case 'proposal': return 'bg-purple-500'
      default: return 'bg-blue-500'
    }
  }

  return (
    <div className="w-full h-full p-6 space-y-6 animate-in fade-in duration-500 overflow-y-auto">
      <LiveRefresh tables={['relationship_assignments', 'follow_ups', 'companies', 'interactions', 'opportunities']} />
      
      {/* 4.1 Company Ownership Grid (Top Module) */}
      <div className="bg-shell border border-border-hairline rounded-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border-hairline flex justify-between items-center bg-surface">
          <h2 className="text-[20px] font-semibold text-text-primary">Company Pipeline</h2>
          <div className="flex gap-2">
            <button className="bg-shell border border-border-hairline px-4 py-1.5 rounded-pill text-xs font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 shadow-sm">
              <Calendar className="w-3.5 h-3.5" /> This Quarter
            </button>
            <DashboardPipelineFilters teamMembers={teamResponse.success ? teamResponse.data : []} />
            <CompanyPipelineActions />
          </div>
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border-hairline text-xs font-medium text-text-muted bg-surface/50">
          <div className="col-span-3">Company</div>
          <div className="col-span-2">Relationship Status</div>
          <div className="col-span-3">Primary Owner</div>
          <div className="col-span-4">Latest Interaction</div>
        </div>
        
        <div className="divide-y divide-border-hairline">
          {summary.pipeline?.map((c: any) => (
            <Link key={c.id} href={`/companies/${c.id}`} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-subtle/30 transition-colors cursor-pointer group">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-cell bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-sm border border-blue-200">
                  {c.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-[15px] group-hover:text-blue-500 transition-colors">{c.name}</p>
                  <p className="text-[13px] text-text-secondary">{c.industry || 'Unknown Industry'}</p>
                </div>
              </div>
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-xs font-medium border ${getStatusStyle(c.status)}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDot(c.status || 'Prospect')}`}></div> {c.status || 'Prospect'}
                </span>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                {c.owner ? (
                  <>
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold border-2 border-shell shadow-sm">
                      {c.owner.full_name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <span className="text-[13px] text-text-primary font-medium">{c.owner.full_name}</span>
                  </>
                ) : (
                  <span className="text-[13px] text-text-muted italic">Unassigned</span>
                )}
              </div>
              <div className="col-span-4">
                {c.lastInteraction ? (
                  <div className="flex flex-col">
                    <span className="text-[13px] text-text-primary truncate">{c.lastInteraction.notes}</span>
                    <span className="text-[11px] text-text-secondary">{formatDistanceToNow(new Date(c.lastInteraction.date))} ago</span>
                  </div>
                ) : (
                  <span className="text-[13px] text-text-muted italic">No interactions yet</span>
                )}
              </div>
            </Link>
          ))}
          {summary.pipeline?.length === 0 && (
            <div className="px-6 py-8 text-center text-text-muted text-[14px]">
              No companies in your pipeline yet.
            </div>
          )}
        </div>
        <div className="px-6 py-3 border-t border-border-hairline bg-surface/50 text-center">
          <Link href="/companies" className="text-[13px] font-medium text-blue-500 hover:text-blue-600">View all companies</Link>
        </div>
      </div>

      {/* Three-Column Footer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 4.4 Follow-up / Interaction Feed */}
        <div className="bg-shell border border-border-hairline rounded-card flex flex-col p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-semibold text-text-primary">Upcoming Follow-ups</h3>
            <button className="text-text-muted hover:text-text-primary p-1">
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          
          {summary.urgentFollowUp && (
            <div className="card-gold rounded-[16px] p-5 shadow-md relative overflow-hidden mb-4 cursor-pointer hover:shadow-lg transition-shadow border border-[#F0B429]/30">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-[16px] leading-tight text-[#78350F]">{summary.urgentFollowUp.title}</h4>
                  <p className="text-[13px] opacity-80 mt-1 font-medium text-[#78350F]">{summary.urgentFollowUp.companyName || 'General'}</p>
                </div>
                {summary.urgentFollowUp.isOverdue && (
                  <span className="bg-red-500 text-white px-2.5 py-1 rounded-pill text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    Overdue
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[13px] font-medium mt-4 text-[#78350F]/80">
                <Clock className="w-4 h-4" /> 
                {summary.urgentFollowUp.isOverdue ? 'Due ' : 'Due in '} 
                {formatDistanceToNow(new Date(summary.urgentFollowUp.due_date))} 
                {summary.urgentFollowUp.isOverdue ? ' ago' : ''}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {summary.regularFollowUps?.map((f: any) => (
              <div key={f.id} className="bg-shell rounded-[16px] p-4 border border-border-hairline cursor-pointer hover:bg-subtle/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-text-primary text-[15px] leading-tight">{f.title}</h4>
                    <p className="text-[13px] text-text-secondary mt-1">{f.companyName || 'General'}</p>
                  </div>
                  <span className="bg-subtle text-text-secondary px-2.5 py-1 rounded-pill text-[11px] font-medium border border-border-hairline">
                    {format(new Date(f.due_date), 'MMM d')}
                  </span>
                </div>
              </div>
            ))}
            {!summary.urgentFollowUp && summary.regularFollowUps?.length === 0 && (
              <div className="text-center py-4 text-text-muted text-[13px]">
                No pending follow-ups.
              </div>
            )}
          </div>
        </div>

        {/* 4.3 Officer Workload Cards */}
        <div className="bg-shell border border-border-hairline rounded-card flex flex-col p-6 shadow-sm">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-semibold text-text-primary">Team Workload</h3>
            <button className="text-text-muted hover:text-text-primary p-1">
              <Users className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {summary.teamWorkload?.map((o: any, idx: number) => {
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
              const color = colors[idx % colors.length]
              
              return (
                <div key={o.id} className="bg-surface p-4 rounded-[16px] border border-border-hairline flex flex-col items-center text-center cursor-pointer hover:bg-subtle/50 transition-colors">
                  <div className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center font-bold text-sm mb-3 border-2 border-shell shadow-sm`}>
                    {o.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-semibold text-text-primary text-[14px]">{o.name}</h4>
                  <p className="text-[12px] text-text-secondary mt-0.5">{o.role}</p>
                  <div className="mt-3 bg-shell border border-border-hairline text-text-secondary text-[11px] px-3 py-1.5 rounded-pill font-medium w-full">
                    {o.activeCount} active assigned
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4.6 Executive Dashboard / Assistant Panel */}
        <div className="bg-shell border border-border-hairline rounded-card flex flex-col p-6 shadow-sm text-center relative overflow-hidden">
          
          <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-10">
            {/* Radial gradient sphere */}
            <div className="w-[100px] h-[100px] rounded-full orb-gradient mb-6 shadow-inner relative flex items-center justify-center group cursor-pointer transition-transform hover:scale-105">
              {/* Glossy highlight */}
              <div className="absolute top-2 left-4 w-[40%] h-[20%] bg-white/60 rounded-full blur-[2px] transform -rotate-12"></div>
              <Search className="w-8 h-8 text-blue-600/50 group-hover:text-blue-600 transition-colors" />
            </div>
            
            <h2 className="text-[24px] font-semibold text-text-primary mb-2">Hello, {firstName}</h2>
            <p className="text-[14px] text-text-secondary mb-8">What insights do you need today?</p>
            
            <div className="flex gap-2 w-full justify-center flex-wrap mb-6">
               <button className="bg-surface border border-border-hairline px-4 py-2 rounded-pill text-[13px] font-medium text-text-primary hover:bg-subtle transition-colors flex items-center gap-1">
                 Export report
               </button>
               <button className="bg-surface border border-border-hairline px-4 py-2 rounded-pill text-[13px] font-medium text-text-primary hover:bg-subtle transition-colors flex items-center gap-1">
                 View overdue
               </button>
            </div>
            
            <div className="w-full mt-auto text-left">
              <SemanticSearchBox />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
