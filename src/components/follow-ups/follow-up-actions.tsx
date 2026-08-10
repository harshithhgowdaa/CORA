'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, X, Loader2 } from 'lucide-react'
import { updateFollowUpStatus } from '@/app/actions/follow-ups'

export function FollowUpActions({
  followUpId,
  currentStatus,
}: {
  followUpId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  const update = async (newStatus: string) => {
    setLoading(true)
    const res = await updateFollowUpStatus(followUpId, newStatus)
    if (res.success) setStatus(newStatus)
    setLoading(false)
  }

  if (status === 'Completed') {
    return (
      <span className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" /> Done
      </span>
    )
  }

  if (status === 'Cancelled') {
    return <span className="text-[12px] text-text-muted">Cancelled</span>
  }

  return (
    <div className="flex items-center gap-1.5">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
      ) : (
        <>
          <button
            onClick={() => update('Completed')}
            className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            title="Mark Complete"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => update('In Progress')}
            className="p-1.5 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 border border-blue-200 transition-colors"
            title="Mark In Progress"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => update('Cancelled')}
            className="p-1.5 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200 transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  )
}
