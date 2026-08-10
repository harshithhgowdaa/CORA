import { getCompanies } from '@/app/actions/companies'
import Link from 'next/link'
import { Building2, Plus, ChevronRight } from 'lucide-react'
import { CompanyPipelineActions } from '@/components/forms/company-pipeline-actions'
import { CompanyFilters } from '@/components/companies/company-filters'
import { format } from 'date-fns'
import { getTeamMembers } from '@/app/actions/companies'

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

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; owner?: string }>
}) {
  const { q, status, owner } = await searchParams
  const [response, teamResponse] = await Promise.all([getCompanies(status || owner ? { status, ownerId: owner } : undefined), getTeamMembers()])
  let companies: any[] = response.success ? response.data : []

  // Client-side text search filter
  if (q) {
    const lower = q.toLowerCase()
    companies = companies.filter(
      c =>
        c.name.toLowerCase().includes(lower) ||
        (c.industry || '').toLowerCase().includes(lower)
    )
  }

  return (
    <div className="w-full h-full p-6 space-y-6 animate-in fade-in duration-500 overflow-y-auto">
      {/* Header */}
      <div className="bg-shell border border-border-hairline rounded-card p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-[24px] font-semibold text-text-primary">Company Pipeline</h1>
            <p className="text-[14px] text-text-secondary mt-1">
              {companies.length} {companies.length === 1 ? 'company' : 'companies'}
            </p>
          </div>
          <CompanyPipelineActions />
        </div>
        <CompanyFilters initialSearch={q || ''} initialStatus={status || 'All'} initialOwner={owner || ''} teamMembers={teamResponse.success ? teamResponse.data : []} />
      </div>

      {/* Table */}
      <div className="bg-shell border border-border-hairline rounded-card overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border-hairline text-xs font-medium text-text-muted bg-surface/50">
          <div className="col-span-3">Company</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Primary Owner</div>
          <div className="col-span-2">Industry</div>
          <div className="col-span-2">Added</div>
        </div>

        <div className="divide-y divide-border-hairline">
          {companies.map((company: any) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-subtle/30 transition-colors group"
            >
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

              <div className="col-span-2 flex items-center justify-between">
                <span className="text-[12px] text-text-muted">
                  {company.created_at ? format(new Date(company.created_at), 'MMM d, yyyy') : '—'}
                </span>
                <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}

          {companies.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-muted text-[14px] mb-2">No companies found</p>
              <p className="text-text-muted text-[13px]">Add your first corporate partner to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
