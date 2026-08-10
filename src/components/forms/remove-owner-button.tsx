'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { removeOwner } from '@/app/actions/companies'

export function RemoveOwnerButton({ assignmentId, companyId, label }: { assignmentId: string; companyId: string; label: string }) {
  const [busy, setBusy] = useState(false)
  const handleRemove = async () => { setBusy(true); const response = await removeOwner(assignmentId, companyId); if (!response.success) window.alert(response.error); else window.location.reload(); setBusy(false) }
  return <button type="button" onClick={handleRemove} disabled={busy} title={`Remove ${label}`} aria-label={`Remove ${label}`} className="ml-1 text-text-muted hover:text-red-500 disabled:opacity-50"><X className="w-3.5 h-3.5" /></button>
}
