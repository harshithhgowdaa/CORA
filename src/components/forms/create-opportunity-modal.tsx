'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, TrendingUp, Loader2 } from 'lucide-react'
import { createOpportunity } from '@/app/actions/opportunities'

const OPP_TYPES = ['Internship Program', 'Placement Hiring', 'Guest Lecture', 'Workshop', 'Industry Project', 'Research Collaboration', 'Sponsorship', 'MoU', 'Hackathon', 'Training Program', 'Other']
const OPP_STAGES = ['Prospect', 'Qualified', 'Meeting', 'Proposal Sent', 'Negotiation', 'Approved', 'Active', 'Completed', 'Lost']

interface TeamMember { id: string; full_name: string; role: string }

export function CreateOpportunityModal({
  isOpen,
  onClose,
  companyId,
  teamMembers = [],
}: {
  isOpen: boolean
  onClose: () => void
  companyId: string
  teamMembers?: TeamMember[]
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.append('company_id', companyId)
    const response = await createOpportunity(formData)
    setLoading(false)
    if (response.success) {
      onClose()
      router.refresh()
    } else {
      setError(response.error || 'Failed to create opportunity')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-shell rounded-shell w-full max-w-lg p-6 shadow-lg border border-border-hairline relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text-primary bg-surface hover:bg-subtle p-2 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-[14px] bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary">Add Opportunity</h2>
            <p className="text-[12px] text-text-secondary">Track a partnership initiative</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] rounded-cell border border-red-100">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Title *</label>
            <input name="title" type="text" required
              className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
              placeholder="e.g. Internship Program 2026" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Type</label>
              <select name="type"
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors appearance-none">
                {OPP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Stage</label>
              <select name="stage"
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors appearance-none">
                {OPP_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Probability (%)</label>
              <input name="probability" type="number" min="0" max="100"
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
                placeholder="50" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Expected Close</label>
              <input name="expected_close" type="date"
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors" />
            </div>
          </div>

          {teamMembers.length > 0 && (
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Initiative Owner</label>
              <select name="initiative_owner_id"
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors appearance-none">
                <option value="">No owner</option>
                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.role})</option>)}
              </select>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-pill text-text-secondary text-[13px] font-medium hover:bg-surface border border-border-hairline transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-pill bg-purple-500 hover:bg-purple-600 text-white text-[13px] font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
