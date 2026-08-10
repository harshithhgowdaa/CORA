'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCompanyStatus } from '@/app/actions/companies'

const STATUSES = ['Prospect', 'Contacted', 'Meeting Scheduled', 'Discussion', 'Proposal', 'Negotiation', 'Partnership Signed', 'Active Partner', 'Dormant', 'Closed']

export function CompanyStatusSelect({ companyId, status }: { companyId: string; status: string }) {
  const router = useRouter(); const [value, setValue] = useState(status || 'Prospect'); const [saving, setSaving] = useState(false)
  const handleChange = async (next: string) => { const previous = value; setValue(next); setSaving(true); const response = await updateCompanyStatus(companyId, next); if (!response.success) { setValue(previous); window.alert(response.error) }; setSaving(false); router.refresh() }
  return <select aria-label="Relationship status" value={value} disabled={saving} onChange={event => handleChange(event.target.value)} className="rounded-pill border border-border-hairline bg-shell px-2.5 py-1 text-[12px] font-medium text-text-secondary outline-none focus:border-blue-500 disabled:opacity-60">{STATUSES.map(item => <option key={item}>{item}</option>)}</select>
}
