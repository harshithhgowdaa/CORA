import { getCompanies, getTeamMembers } from '@/app/actions/companies'
import { CompanyPipelineActions } from '@/components/forms/company-pipeline-actions'
import { CompanyFilters } from '@/components/companies/company-filters'
import { CompanyListTable } from '@/components/companies/company-list-table'
import { requireUser } from '@/lib/authz'

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; owner?: string }>
}) {
  const { q, status, owner } = await searchParams
  const [currentUser, response, teamResponse] = await Promise.all([
    requireUser().catch(() => null),
    getCompanies(status || owner ? { status, ownerId: owner } : undefined),
    getTeamMembers()
  ])
  const isAdmin = currentUser?.role === 'admin'
  let companies: any[] = response.success ? response.data : []

  // Client-side text search filter
  if (q) {
    const lower = q.toLowerCase()
    companies = companies.filter(
      c =>
        c.name.toLowerCase().includes(lower) ||
        (c.industry || '').toLowerCase().includes(lower) ||
        JSON.stringify(c).toLowerCase().includes(lower)
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
          <CompanyPipelineActions isAdmin={isAdmin} />
        </div>
        <CompanyFilters initialSearch={q || ''} initialStatus={status || 'All'} initialOwner={owner || ''} teamMembers={teamResponse.success ? teamResponse.data : []} />
      </div>

      {/* Table */}
      <CompanyListTable companies={companies} isAdmin={isAdmin} />
    </div>
  )
}
