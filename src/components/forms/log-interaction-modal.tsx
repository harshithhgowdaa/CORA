'use client'

import { useState } from 'react'
import { X, MessageSquarePlus, Loader2 } from 'lucide-react'
import { createInteraction } from '@/app/actions/interactions'

export function LogInteractionModal({ 
  isOpen, 
  onClose,
  companyId,
  alumniId
}: { 
  isOpen: boolean, 
  onClose: () => void,
  companyId?: string,
  alumniId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    if (companyId) formData.append('company_id', companyId)
    if (alumniId) formData.append('alumni_id', alumniId)
    
    // Ensure date is ISO
    const dateStr = formData.get('date') as string
    if (dateStr) {
      formData.set('date', new Date(dateStr).toISOString())
    } else {
      formData.set('date', new Date().toISOString())
    }
    
    const response = await createInteraction(formData)

    setLoading(false)
    
    if (response.success) {
      onClose()
      window.location.reload()
    } else {
      setError(response.error || 'Failed to log interaction')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-shell rounded-shell w-full max-w-md p-6 shadow-lg border border-border-hairline relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-text-muted hover:text-text-primary bg-surface hover:bg-subtle p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-[16px] bg-blue-100 text-blue-500 flex items-center justify-center border border-blue-200">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-text-primary">Log Interaction</h2>
            <p className="text-[13px] text-text-secondary">Record a recent meeting or call</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-cell border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Type</label>
              <select 
                name="type"
                required
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors appearance-none"
              >
                <option value="Meeting">Meeting</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Email">Email</option>
                <option value="Campus Visit">Campus Visit</option>
                <option value="Guest Lecture">Guest Lecture</option>
                <option value="Workshop">Workshop</option>
                <option value="Partnership Discussion">Partnership Discussion</option>
                <option value="Internship Discussion">Internship Discussion</option>
                <option value="Placement Discussion">Placement Discussion</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Date</label>
              <input 
                name="date"
                type="datetime-local" 
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Notes</label>
            <textarea 
              name="notes"
              required
              rows={3}
              className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors resize-none"
              placeholder="What was discussed?"
            ></textarea>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Outcome</label>
            <input
              name="outcome"
              type="text"
              className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
              placeholder="e.g. Agreed to send proposal by Friday"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-pill text-text-secondary text-[14px] font-medium hover:bg-surface border border-border-hairline transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 rounded-pill bg-blue-500 hover:bg-blue-600 text-white text-[14px] font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Interaction
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
