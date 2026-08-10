'use client'

import { useState } from 'react'
import { X, Building2, Loader2 } from 'lucide-react'
import { createCompany } from '@/app/actions/companies'

const STATUSES = ['Prospect', 'Contacted', 'Meeting Scheduled', 'Discussion', 'Proposal', 'Negotiation', 'Partnership Signed', 'Active Partner', 'Dormant', 'Closed']

export function CreateCompanyModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const response = await createCompany(formData)
    setLoading(false)
    if (response.success) {
      onClose()
      window.location.reload()
    } else {
      setError(response.error || 'Failed to create company')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-shell rounded-shell w-full max-w-md p-6 shadow-lg border border-border-hairline relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text-primary bg-surface hover:bg-subtle p-2 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-[14px] bg-blue-100 text-blue-500 flex items-center justify-center border border-blue-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary">Add Company</h2>
            <p className="text-[12px] text-text-secondary">Create a new corporate partnership</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] rounded-cell border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Company Name *</label>
            <input
              name="name"
              type="text"
              required
              className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
              placeholder="e.g. Bosch India"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Industry</label>
              <input
                name="industry"
                type="text"
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
                placeholder="e.g. Technology"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Status</label>
              <select
                name="status"
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors appearance-none"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Website</label>
            <input
              name="website"
              type="url"
              className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Notes</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors resize-none"
              placeholder="Brief description or context..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-pill text-text-secondary text-[13px] font-medium hover:bg-surface border border-border-hairline transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-pill bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create Company
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
