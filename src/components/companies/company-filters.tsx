'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'

const STATUSES = ['All', 'Prospect', 'Contacted', 'Meeting Scheduled', 'Discussion', 'Proposal', 'Negotiation', 'Partnership Signed', 'Active Partner', 'Dormant', 'Closed']

interface TeamMember { id: string; full_name: string }
export function CompanyFilters({ initialSearch = '', initialStatus = 'All', initialOwner = '', teamMembers = [] }: { initialSearch?: string; initialStatus?: string; initialOwner?: string; teamMembers?: TeamMember[] }) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [activeStatus, setActiveStatus] = useState(initialStatus)
  const [activeOwner, setActiveOwner] = useState(initialOwner)

  const handleSearch = (val: string) => {
    setSearch(val)
    const params = new URLSearchParams()
    if (val) params.set('q', val)
    if (activeStatus !== 'All') params.set('status', activeStatus)
    if (activeOwner) params.set('owner', activeOwner)
    router.push(`/companies?${params.toString()}`)
  }

  const handleStatus = (s: string) => {
    setActiveStatus(s)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (s !== 'All') params.set('status', s)
    if (activeOwner) params.set('owner', activeOwner)
    router.push(`/companies?${params.toString()}`)
  }

  const handleOwner = (owner: string) => { setActiveOwner(owner); const params = new URLSearchParams(); if (search) params.set('q', search); if (activeStatus !== 'All') params.set('status', activeStatus); if (owner) params.set('owner', owner); router.push(`/companies?${params.toString()}`) }

  return (
    <div className="space-y-3">
      <div className="bg-subtle px-4 py-2.5 rounded-pill flex items-center border border-transparent focus-within:border-blue-500 focus-within:bg-shell transition-all max-w-md">
        <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search companies..."
          className="bg-transparent border-none outline-none ml-2 text-[13px] w-full text-text-primary placeholder:text-text-muted"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => handleStatus(s)}
            className={`px-3 py-1 rounded-pill text-[12px] font-medium border transition-colors ${
              activeStatus === s
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-shell border-border-hairline text-text-secondary hover:text-text-primary'
            }`}
          >
            {s}
          </button>
        ))}
        <select value={activeOwner} onChange={event => handleOwner(event.target.value)} aria-label="Filter companies by owner" className="px-3 py-1 rounded-pill text-[12px] font-medium border border-border-hairline bg-shell text-text-secondary">
          <option value="">All owners</option>
          {teamMembers.map(member => <option key={member.id} value={member.id}>{member.full_name}</option>)}
        </select>
      </div>
    </div>
  )
}
