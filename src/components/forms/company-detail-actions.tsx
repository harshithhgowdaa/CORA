'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquarePlus, CalendarClock, UserPlus, ChevronDown, Building2, Trash2 } from 'lucide-react'
import { LogInteractionModal } from './log-interaction-modal'
import { AddFollowUpModal } from './add-followup-modal'
import { AddContactModal } from './add-contact-modal'
import { CreateOpportunityModal } from './create-opportunity-modal'
import { AssignOwnerModal } from './assign-owner-modal'
import { deleteCompany } from '@/app/actions/companies'

interface TeamMember {
  id: string
  full_name: string
  role: string
}

export function CompanyDetailActions({
  companyId,
  teamMembers = [],
}: {
  companyId: string
  teamMembers?: TeamMember[]
}) {
  const [isLogInteractionOpen, setLogInteractionOpen] = useState(false)
  const [isAddFollowUpOpen, setAddFollowUpOpen] = useState(false)
  const [isAddContactOpen, setAddContactOpen] = useState(false)
  const [isCreateOppOpen, setCreateOppOpen] = useState(false)
  const [isAssignOwnerOpen, setAssignOwnerOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    if (!window.confirm('Delete this company and its CRM history? This cannot be undone.')) return
    setDeleting(true)
    const response = await deleteCompany(companyId)
    if (response.success) router.push('/companies')
    else { setDeleting(false); window.alert(response.error) }
  }

  return (
    <>
      <div className="flex gap-2 relative">
        {/* Primary action */}
        <button
          onClick={() => setLogInteractionOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-pill text-[13px] font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2"
        >
          <MessageSquarePlus className="w-4 h-4" /> Log Interaction
        </button>

        {/* More actions dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(v => !v)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="bg-shell border border-border-hairline px-3 py-2 rounded-pill text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 shadow-sm"
          >
            More <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-shell rounded-[14px] border border-border-hairline shadow-lg z-50 overflow-hidden">
              <button onClick={() => { setAddFollowUpOpen(true); setShowDropdown(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-text-primary hover:bg-subtle transition-colors text-left">
                <CalendarClock className="w-4 h-4 text-text-muted" /> Add Follow-up
              </button>
              <button onClick={() => { setAddContactOpen(true); setShowDropdown(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-text-primary hover:bg-subtle transition-colors text-left">
                <UserPlus className="w-4 h-4 text-text-muted" /> Add Contact
              </button>
              <button onClick={() => { setCreateOppOpen(true); setShowDropdown(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-text-primary hover:bg-subtle transition-colors text-left">
                <Building2 className="w-4 h-4 text-text-muted" /> Add Opportunity
              </button>
              <div className="border-t border-border-hairline" />
              <button onClick={() => { setAssignOwnerOpen(true); setShowDropdown(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-text-primary hover:bg-subtle transition-colors text-left">
                <UserPlus className="w-4 h-4 text-text-muted" /> Assign Owner
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-red-600 hover:bg-red-50 transition-colors text-left border-t border-border-hairline">
                <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete Company'}
              </button>
            </div>
          )}
        </div>
      </div>

      <LogInteractionModal
        isOpen={isLogInteractionOpen}
        onClose={() => setLogInteractionOpen(false)}
        companyId={companyId}
      />
      <AddFollowUpModal
        isOpen={isAddFollowUpOpen}
        onClose={() => setAddFollowUpOpen(false)}
        companyId={companyId}
        teamMembers={teamMembers}
      />
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setAddContactOpen(false)}
        companyId={companyId}
      />
      <CreateOpportunityModal
        isOpen={isCreateOppOpen}
        onClose={() => setCreateOppOpen(false)}
        companyId={companyId}
        teamMembers={teamMembers}
      />
      <AssignOwnerModal
        isOpen={isAssignOwnerOpen}
        onClose={() => setAssignOwnerOpen(false)}
        companyId={companyId}
        teamMembers={teamMembers}
      />
    </>
  )
}
