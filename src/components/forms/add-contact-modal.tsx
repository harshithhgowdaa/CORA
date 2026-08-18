'use client'

import { useState } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'
import { createContact } from '@/app/actions/contacts'

export function AddContactModal({ 
  isOpen, 
  onClose,
  companyId
}: { 
  isOpen: boolean, 
  onClose: () => void,
  companyId: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<Array<{ label: string; value: string; type: 'email' | 'phone' | 'linkedin' | 'url' | 'other' }>>([])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('company_id', companyId)
    formData.set('additional_details', JSON.stringify(details.filter(detail => detail.label.trim() && detail.value.trim())))
    
    const response = await createContact(formData)

    setLoading(false)
    
    if (response.success) {
      onClose()
      window.location.reload()
    } else {
      setError(response.error || 'Failed to add contact')
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
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-text-primary">Add Contact</h2>
            <p className="text-[13px] text-text-secondary">Register a new stakeholder</p>
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
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">First Name</label>
              <input 
                name="first_name"
                type="text" 
                required
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Last Name</label>
              <input 
                name="last_name"
                type="text" 
                required
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-cell border border-border-hairline p-3 bg-surface">
            <div className="flex items-center justify-between"><p className="text-[12px] font-medium text-text-secondary">Extra contact details</p><button type="button" onClick={() => setDetails(current => [...current, { label: '', value: '', type: 'other' }])} className="text-xs text-blue-600">+ Add detail</button></div>
            {details.map((detail, index) => <div key={index} className="grid grid-cols-[100px_1fr_auto] gap-2"><select value={detail.type} onChange={event => setDetails(current => current.map((item, position) => position === index ? { ...item, type: event.target.value as typeof item.type } : item))} className="border border-border-hairline rounded px-2 text-xs"><option value="email">Email</option><option value="phone">Phone</option><option value="linkedin">LinkedIn</option><option value="url">URL</option><option value="other">Other</option></select><input value={detail.value} onChange={event => setDetails(current => current.map((item, position) => position === index ? { ...item, value: event.target.value, label: item.label || event.target.value } : item))} placeholder="Value" className="min-w-0 border border-border-hairline rounded px-2 text-xs" /><button type="button" onClick={() => setDetails(current => current.filter((_, position) => position !== index))} className="text-xs text-red-600">Remove</button></div>)}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Job Title / Role</label>
            <input 
              name="role"
              type="text" 
              className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
              placeholder="e.g. VP of Engineering"
            />
          </div>
          
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email Address</label>
            <input 
              name="email"
              type="email" 
              className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
              placeholder="e.g. name@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Phone</label>
              <input 
                name="phone"
                type="tel" 
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
                placeholder="+91 ..."
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">LinkedIn</label>
              <input 
                name="linkedin"
                type="url" 
                className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
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
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
