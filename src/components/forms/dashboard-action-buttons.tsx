'use client'

import { useState } from 'react'
import { Building2, Users, TrendingUp } from 'lucide-react'
import { CreateCompanyModal } from './create-company-modal'

export function DashboardActionButtons() {
  const [isCompanyModalOpen, setCompanyModalOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2 w-full justify-center flex-wrap mb-8">
        <button 
          onClick={() => setCompanyModalOpen(true)}
          className="glass-pill px-4 py-2 text-xs font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors hover:bg-white"
        >
          <Building2 className="w-3 h-3" /> Add Company
        </button>
        <button 
          onClick={() => alert('Log Interaction modal coming soon!')}
          className="glass-pill px-4 py-2 text-xs font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors hover:bg-white"
        >
          <Users className="w-3 h-3" /> Log Interaction
        </button>
        <button 
          onClick={() => alert('Pipeline modal coming soon!')}
          className="glass-pill px-4 py-2 text-xs font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors hover:bg-white"
        >
          <TrendingUp className="w-3 h-3" /> Pipeline
        </button>
      </div>

      <CreateCompanyModal 
        isOpen={isCompanyModalOpen} 
        onClose={() => setCompanyModalOpen(false)} 
      />
    </>
  )
}
