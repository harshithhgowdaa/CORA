'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const STATUSES = ['All', 'Prospect', 'Contacted', 'Meeting Scheduled', 'Discussion', 'Proposal', 'Negotiation', 'Partnership Signed', 'Active Partner', 'Dormant', 'Closed']
interface TeamMember { id: string; full_name: string }

export function DashboardPipelineFilters({ teamMembers }: { teamMembers: TeamMember[] }) {
  const router = useRouter(); const searchParams = useSearchParams(); const status = searchParams.get('status') ?? 'All'; const owner = searchParams.get('owner') ?? ''
  const update = (key: string, value: string) => { const params = new URLSearchParams(searchParams.toString()); if (!value || value === 'All') params.delete(key); else params.set(key, value); router.push(`/?${params.toString()}`) }
  return <div className="flex flex-wrap gap-2"><select value={status} onChange={event => update('status', event.target.value)} aria-label="Filter companies by relationship status" className="bg-shell border border-border-hairline px-3 py-1.5 rounded-pill text-xs text-text-secondary"><option value="All">All statuses</option>{STATUSES.slice(1).map(item => <option key={item}>{item}</option>)}</select><select value={owner} onChange={event => update('owner', event.target.value)} aria-label="Filter companies by owner" className="bg-shell border border-border-hairline px-3 py-1.5 rounded-pill text-xs text-text-secondary"><option value="">All owners</option>{teamMembers.map(member => <option key={member.id} value={member.id}>{member.full_name}</option>)}</select></div>
}
