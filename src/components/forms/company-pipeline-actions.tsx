'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreateCompanyModal } from './create-company-modal'

export function CompanyPipelineActions() {
  const [isCompanyModalOpen, setCompanyModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setCompanyModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-1.5 rounded-pill text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" /> Add Company
      </button>

      <CreateCompanyModal 
        isOpen={isCompanyModalOpen} 
        onClose={() => setCompanyModalOpen(false)} 
      />
    </>
  )
}
