'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Users, Loader2 } from 'lucide-react'
import { assignOwner } from '@/app/actions/companies'

interface TeamMember { id: string; full_name: string; role: string }

export function AssignOwnerModal({
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
  const [type, setType] = useState<'PRIMARY' | 'SUPPORT'>('PRIMARY')
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const userId = formData.get('user_id') as string
    if (!userId) { setError('Please select a team member'); setLoading(false); return }

    const response = await assignOwner(companyId, userId, type)
    setLoading(false)
    if (response.success) {
      onClose()
      router.refresh()
    } else {
      setError(response.error || 'Failed to assign owner')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-shell rounded-shell w-full max-w-md p-6 shadow-lg border border-border-hairline relative">
        <button onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text-primary bg-surface hover:bg-subtle p-2 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-[14px] bg-blue-100 text-blue-500 flex items-center justify-center border border-blue-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary">Assign Owner</h2>
            <p className="text-[12px] text-text-secondary">Set relationship ownership</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] rounded-cell border border-red-100">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-2">Assignment Type</label>
            <div className="flex gap-2">
              {(['PRIMARY', 'SUPPORT'] as const).map(t => (
                <button key={t} type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 px-3 rounded-pill text-[13px] font-medium border transition-colors ${
                    type === t ? 'bg-blue-500 text-white border-blue-500' : 'bg-shell border-border-hairline text-text-secondary hover:text-text-primary'
                  }`}>
                  {t === 'PRIMARY' ? 'Primary Owner' : 'Supporting Officer'}
                </button>
              ))}
            </div>
            {type === 'PRIMARY' && (
              <p className="text-[11px] text-text-muted mt-1.5">This will replace the current primary owner.</p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Team Member</label>
            <select name="user_id" required
              className="w-full bg-subtle border border-border-hairline rounded-cell px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-blue-500 focus:bg-shell transition-colors appearance-none">
              <option value="">Select a team member</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>{m.full_name} — {m.role}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-pill text-text-secondary text-[13px] font-medium hover:bg-surface border border-border-hairline transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-pill bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
