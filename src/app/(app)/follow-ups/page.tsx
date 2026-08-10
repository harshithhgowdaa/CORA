import { getFollowUps, updateFollowUpStatus } from '@/app/actions/follow-ups'
import { format, formatDistanceToNow } from 'date-fns'
import { Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { FollowUpActions } from '@/components/follow-ups/follow-up-actions'
import { getTeamMembers } from '@/app/actions/companies'
import { FollowUpOfficerFilter } from '@/components/follow-ups/follow-up-officer-filter'

const PRIORITY_COLORS: Record<string, string> = {
  'Critical': 'bg-red-100 text-red-700 border-red-200',
  'High':     'bg-orange-100 text-orange-700 border-orange-200',
  'Medium':   'bg-blue-100 text-blue-700 border-blue-200',
  'Low':      'bg-gray-100 text-gray-600 border-gray-200',
}

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; officer?: string }>
}) {
  const { status, priority, officer } = await searchParams
  const [response, teamResponse] = await Promise.all([getFollowUps({ status, priority, officer_id: officer }), getTeamMembers()])
  const followUps: any[] = response.success ? response.data : []

  const now = new Date()
  const overdue = followUps.filter(f => f.status !== 'Completed' && f.status !== 'Cancelled' && new Date(f.due_date) < now)
  const dueToday = followUps.filter(f => {
    if (f.status === 'Completed' || f.status === 'Cancelled') return false
    const d = new Date(f.due_date)
    const isAfterNow = d >= now
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999)
    return isAfterNow && d <= endOfDay
  })
  const upcoming = followUps.filter(f => {
    if (f.status === 'Completed' || f.status === 'Cancelled') return false
    const d = new Date(f.due_date)
    return d > now
  })
  const completed = followUps.filter(f => f.status === 'Completed' || f.status === 'Cancelled')

  return (
    <div className="w-full h-full p-6 space-y-6 animate-in fade-in duration-500 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary">Follow-ups</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">
            {overdue.length > 0 && <span className="text-red-500 font-medium">{overdue.length} overdue · </span>}
            {dueToday.length > 0 && <span className="text-amber-500 font-medium">{dueToday.length} due today · </span>}
            {upcoming.length} upcoming
          </p>
        </div>
        <div className="flex gap-2">
          <FollowUpOfficerFilter teamMembers={teamResponse.success ? teamResponse.data : []} selectedOfficer={officer || ''} status={status} priority={priority} />
          {[
            { label: 'All', value: undefined },
            { label: 'Overdue', value: 'Overdue' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Completed', value: 'Completed' },
          ].map(f => (
            <Link key={f.label} href={`/follow-ups?${new URLSearchParams({ ...(f.value ? { status: f.value } : {}), ...(priority ? { priority } : {}), ...(officer ? { officer } : {}) }).toString()}`}
              className={`px-3 py-1.5 rounded-pill text-[12px] font-medium border transition-colors ${
                status === f.value || (!status && !f.value)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-shell border-border-hairline text-text-secondary hover:text-text-primary'
              }`}>
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Overdue', count: overdue.length, icon: AlertCircle, color: 'text-red-500 bg-red-50 border-red-200' },
          { label: 'Due Today', count: dueToday.length, icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-200' },
          { label: 'Upcoming', count: upcoming.length, icon: Calendar, color: 'text-blue-500 bg-blue-50 border-blue-200' },
          { label: 'Completed', count: completed.length, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
        ].map(stat => (
          <div key={stat.label} className="bg-shell border border-border-hairline rounded-card p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center border mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[22px] font-bold text-text-primary">{stat.count}</p>
            <p className="text-[12px] text-text-secondary mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Follow-up list */}
      <div className="bg-shell border border-border-hairline rounded-card overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border-hairline text-xs font-medium text-text-muted bg-surface/50">
          <div className="col-span-4">Task</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2">Officer</div>
          <div className="col-span-2">Actions</div>
        </div>

        <div className="divide-y divide-border-hairline">
          {followUps.map((f: any) => {
            const isOverdue = f.status !== 'Completed' && f.status !== 'Cancelled' && f.due_date && new Date(f.due_date) < now
            const isDone = f.status === 'Completed' || f.status === 'Cancelled'
            return (
              <div key={f.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center ${isOverdue ? 'bg-red-50/40' : ''} hover:bg-subtle/20 transition-colors`}>
                <div className="col-span-4 min-w-0">
                  <p className={`font-medium text-[14px] truncate ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {f.title}
                  </p>
                  {f.companyName && (
                    <Link href={`/companies/${f.company_id}`}
                      className="text-[12px] text-blue-500 hover:underline truncate block mt-0.5">
                      {f.companyName}
                    </Link>
                  )}
                </div>

                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-[11px] font-medium border ${PRIORITY_COLORS[f.priority] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {f.priority || 'Medium'}
                  </span>
                </div>

                <div className="col-span-2">
                  {f.due_date ? (
                    <div>
                      <p className={`text-[13px] font-medium ${isOverdue ? 'text-red-600' : 'text-text-primary'}`}>
                        {format(new Date(f.due_date), 'MMM d')}
                      </p>
                      <p className={`text-[11px] ${isOverdue ? 'text-red-400' : 'text-text-muted'}`}>
                        {isOverdue ? 'Overdue' : formatDistanceToNow(new Date(f.due_date), { addSuffix: true })}
                      </p>
                    </div>
                  ) : <span className="text-text-muted text-[13px]">—</span>}
                </div>

                <div className="col-span-2">
                  <span className="text-[13px] text-text-secondary truncate">
                    {f.officer?.full_name || 'Unassigned'}
                  </span>
                </div>

                <div className="col-span-2">
                  <FollowUpActions followUpId={f.id} currentStatus={f.status} />
                </div>
              </div>
            )
          })}

          {followUps.length === 0 && (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-60" />
              <p className="text-text-muted text-[14px]">No follow-ups found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
