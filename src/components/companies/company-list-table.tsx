'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, ChevronRight, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { deleteCompany } from '@/app/actions/companies'

const STATUS_STYLES: Record<string, string> = {
  'Prospect': 'bg-gray-100 text-gray-600 border-gray-200',
  'Contacted': 'bg-blue-100 text-blue-600 border-blue-200',
  'Meeting Scheduled': 'bg-indigo-100 text-indigo-600 border-indigo-200',
  'Discussion': 'bg-violet-100 text-violet-600 border-violet-200',
  'Proposal': 'bg-purple-100 text-purple-600 border-purple-200',
  'Negotiation': 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
  'Partnership Signed': 'bg-emerald-100 text-emerald-600 border-emerald-200',
  'Active Partner': 'bg-emerald-100 text-emerald-600 border-emerald-200',
  'Dormant': 'bg-orange-100 text-orange-600 border-orange-200',
  'Closed': 'bg-red-100 text-red-600 border-red-200',
}

export function CompanyListTable({ companies = [], isAdmin = false }: { companies: any[]; isAdmin?: boolean }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)

  const allSelected = companies.length > 0 && selectedIds.length === companies.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(companies.map(c => c.id))
    }
  }

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  const handleDelete = async (idsToDelete: string[], e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const count = idsToDelete.length
    if (count === 0) return
    const msg = count === 1 
      ? 'Delete this company and all its associated CRM data?' 
      : `Delete ${count} selected companies and all their associated CRM data?`
    
    if (!window.confirm(msg)) return

    setDeleting(true)
    const res = await deleteCompany(idsToDelete)
    setDeleting(false)

    if (res.success) {
      setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)))
      router.refresh()
    } else {
      window.alert(res.error || 'Failed to delete company')
    }
  }

  return (
    <div className="bg-shell border border-border-hairline rounded-card overflow-hidden shadow-sm">
      {/* Bulk actions bar if selection exists */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50/70 border-b border-blue-200 px-6 py-2.5 flex items-center justify-between animate-in fade-in duration-200">
          <span className="text-xs font-semibold text-blue-800">
            {selectedIds.length} {selectedIds.length === 1 ? 'company' : 'companies'} selected
          </span>
          <button
            onClick={(e) => handleDelete(selectedIds, e)}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-pill text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
          </button>
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border-hairline text-xs font-medium text-text-muted bg-surface/50 items-center">
        <div className="col-span-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="rounded border-border-hairline text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
          />
        </div>
        <div className="col-span-3">Company</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Primary Owner</div>
        <div className="col-span-2">Industry</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <div className="divide-y divide-border-hairline">
        {companies.map((company: any) => {
          const isSelected = selectedIds.includes(company.id)
          return (
            <div
              key={company.id}
              onClick={() => router.push(`/companies/${company.id}`)}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-subtle/30 transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/20' : ''}`}
            >
              <div className="col-span-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => toggleSelectOne(company.id, e as any)}
                  className="rounded border-border-hairline text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
              </div>

              <div className="col-span-3 flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-cell bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-sm border border-blue-200 flex-shrink-0">
                  {company.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary text-[15px] truncate group-hover:text-blue-500 transition-colors">
                    {company.name}
                  </p>
                  {company.website && (
                    <p className="text-[11px] text-text-muted truncate">{company.website.replace(/^https?:\/\//, '')}</p>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-[11px] font-medium border ${STATUS_STYLES[company.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {company.status || 'Prospect'}
                </span>
              </div>

              <div className="col-span-3">
                {company.primaryOwner ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold border-2 border-shell flex-shrink-0">
                      {company.primaryOwner.full_name?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[13px] text-text-primary font-medium truncate">
                      {company.primaryOwner.full_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-[12px] text-text-muted italic">Unassigned</span>
                )}
              </div>

              <div className="col-span-2">
                <span className="text-[13px] text-text-secondary">{company.industry || '—'}</span>
              </div>

              <div className="col-span-1 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleDelete([company.id], e)}
                  disabled={deleting}
                  title="Delete Company"
                  className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )
        })}

        {companies.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-muted text-[14px] mb-2">No companies found</p>
            <p className="text-text-muted text-[13px]">Add your first corporate partner to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
