'use client'

import { useState } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { CreateCompanyModal } from './create-company-modal'
import { clearAllSystemData } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'
import { CompanyImportModal } from '@/components/companies/company-import-modal'

export function CompanyPipelineActions({ isAdmin = false }: { isAdmin?: boolean }) {
  const [isCompanyModalOpen, setCompanyModalOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [isImportOpen, setImportOpen] = useState(false)
  const router = useRouter()

  const handleClearAll = async () => {
    if (!window.confirm('CRITICAL WARNING: Are you sure you want to erase ALL companies and CRM records in the system? This action cannot be undone.')) return
    setClearing(true)
    const res = await clearAllSystemData()
    setClearing(false)
    if (res.success) {
      window.alert('All system data has been successfully cleared.')
      router.refresh()
    } else {
      window.alert(res.error || 'Failed to clear system data')
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <button
            onClick={handleClearAll}
            disabled={clearing}
            className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-pill text-xs font-medium hover:bg-red-100 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            title="Clear all companies and CRM records"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {clearing ? 'Erasing...' : 'Clear System Data'}
          </button>
        )}
        <button onClick={() => setImportOpen(true)} className="bg-shell text-text-secondary border border-border-hairline px-3 py-1.5 rounded-pill text-xs font-medium hover:bg-subtle transition-colors shadow-sm flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5" /> Import file
        </button>
        <button
          onClick={() => setCompanyModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-1.5 rounded-pill text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Company
        </button>
      </div>

      <CreateCompanyModal 
        isOpen={isCompanyModalOpen} 
        onClose={() => setCompanyModalOpen(false)} 
      />
      <CompanyImportModal isOpen={isImportOpen} onClose={() => setImportOpen(false)} />
    </>
  )
}
