'use client'

import { useRouter } from 'next/navigation'

interface TeamMember { id: string; full_name: string }

export function FollowUpOfficerFilter({ teamMembers, selectedOfficer, status, priority }: { teamMembers: TeamMember[]; selectedOfficer: string; status?: string; priority?: string }) {
  const router = useRouter()
  return <select name="officer" value={selectedOfficer} onChange={event => { const params = new URLSearchParams(); if (status) params.set('status', status); if (priority) params.set('priority', priority); if (event.target.value) params.set('officer', event.target.value); router.push(`/follow-ups?${params.toString()}`) }} aria-label="Filter follow-ups by officer" className="bg-shell border border-border-hairline px-3 py-1.5 rounded-pill text-[12px] text-text-secondary"><option value="">All officers</option>{teamMembers.map(member => <option key={member.id} value={member.id}>{member.full_name}</option>)}</select>
}
