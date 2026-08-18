import { getCompany, getTeamMembers } from '@/app/actions/companies'
import { InteractionLog } from '@/components/interactions/interaction-log'
import { Building2, Globe, Briefcase, ChevronLeft, Mail, Phone, BriefcaseBusiness, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { CompanyDetailActions } from '@/components/forms/company-detail-actions'
import { format, formatDistanceToNow } from 'date-fns'
import { RemoveOwnerButton } from '@/components/forms/remove-owner-button'
import { CompanyStatusSelect } from '@/components/forms/company-status-select'
import { CompanyResearchCard } from '@/components/companies/company-research-card'

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

const FOLLOW_UP_PRIORITY: Record<string, string> = {
  'Critical': 'text-red-600 bg-red-50 border-red-200',
  'High': 'text-orange-600 bg-orange-50 border-orange-200',
  'Medium': 'text-blue-600 bg-blue-50 border-blue-200',
  'Low': 'text-gray-600 bg-gray-50 border-gray-200',
}

const OPP_STAGE_COLORS: Record<string, string> = {
  'Prospect': 'bg-gray-100 text-gray-600',
  'Qualified': 'bg-blue-100 text-blue-600',
  'Meeting': 'bg-indigo-100 text-indigo-600',
  'Proposal Sent': 'bg-purple-100 text-purple-600',
  'Negotiation': 'bg-amber-100 text-amber-600',
  'Approved': 'bg-teal-100 text-teal-600',
  'Active': 'bg-emerald-100 text-emerald-600',
  'Completed': 'bg-green-100 text-green-600',
  'Lost': 'bg-red-100 text-red-600',
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [res, teamRes] = await Promise.all([
    getCompany(id),
    getTeamMembers(),
  ])

  if (!res.success) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-shell border border-border-hairline rounded-card p-8 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">Company Not Found</h2>
          <p className="text-[13px] text-text-secondary mb-4">{res.error}</p>
          <Link href="/companies" className="text-blue-500 text-[13px] font-medium hover:underline">← Back to Companies</Link>
        </div>
      </div>
    )
  }

  const company = res.data
  const teamMembers = teamRes.success ? teamRes.data : []

  const primaryOwner = company.assignments?.find((a: any) => a.assignment_type === 'PRIMARY')
  // Supabase returns related rows as arrays when using foreign keys without !inner
  const getPrimaryUser = (a: any) => Array.isArray(a.users) ? a.users[0] : a.users
  const supportingOfficers = company.assignments?.filter((a: any) => a.assignment_type === 'SUPPORT') || []

  const now = new Date()
  const overdueFollowUps = company.followUps?.filter((f: any) => f.status !== 'Completed' && f.status !== 'Cancelled' && new Date(f.due_date) < now) || []

  return (
    <div className="w-full h-full p-6 space-y-6 animate-in fade-in duration-500 overflow-y-auto">

      {/* Breadcrumb & Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-[13px] text-text-muted">
          <Link href="/companies" className="hover:text-blue-500 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Companies
          </Link>
          <span>/</span>
          <span className="text-text-primary font-medium">{company.name}</span>
        </div>
        <CompanyDetailActions companyId={company.id} teamMembers={teamMembers} />
      </div>

      {/* Header Card */}
      <div className="bg-shell p-6 rounded-card border border-border-hairline shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-cell flex items-center justify-center flex-shrink-0 border border-blue-200 text-xl font-bold">
            {company.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[24px] font-semibold text-text-primary">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-[12px] font-medium border ${STATUS_STYLES[company.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {company.status || 'Prospect'}
                  </span>
                  <CompanyStatusSelect companyId={company.id} status={company.status || 'Prospect'} />
                  {company.industry && (
                    <span className="flex items-center text-[13px] text-text-secondary gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {company.industry}
                    </span>
                  )}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-[13px] text-blue-500 hover:underline gap-1">
                      <Globe className="w-3.5 h-3.5" /> {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
              {overdueFollowUps.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-pill text-[12px] font-medium text-red-600 flex-shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {overdueFollowUps.length} overdue
                </div>
              )}
            </div>
            {company.notes && (
              <p className="text-[13px] text-text-secondary mt-3 leading-relaxed">{company.notes}</p>
            )}
          </div>
        </div>

        {/* Ownership Row */}
        <div className="mt-5 pt-5 border-t border-border-hairline flex flex-wrap gap-6">
          <div>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">Primary Owner</p>
            {primaryOwner ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  {getPrimaryUser(primaryOwner)?.full_name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">{getPrimaryUser(primaryOwner)?.full_name}</p>
                  <p className="text-[11px] text-text-muted">{getPrimaryUser(primaryOwner)?.role}</p>
                </div>
                <RemoveOwnerButton assignmentId={primaryOwner.id} companyId={company.id} label="primary owner" />
              </div>
            ) : (
              <span className="text-[13px] text-text-muted italic">Unassigned</span>
            )}
          </div>

          {supportingOfficers.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">Supporting Officers</p>
              <div className="flex -space-x-2">
                {supportingOfficers.map((a: any) => {
                    const u = getPrimaryUser(a)
                    return (
                      <div
                        key={a.id}
                        title={u?.full_name}
                        className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold border-2 border-shell"
                      >
                        {u?.full_name?.substring(0, 2).toUpperCase()}
                        <RemoveOwnerButton assignmentId={a.id} companyId={company.id} label={u?.full_name ?? 'supporting officer'} />
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          <div className="ml-auto">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">Stats</p>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-[18px] font-bold text-text-primary">{company.interactions?.length || 0}</p>
                <p className="text-[11px] text-text-muted">Interactions</p>
              </div>
              <div>
                <p className="text-[18px] font-bold text-text-primary">{company.opportunities?.length || 0}</p>
                <p className="text-[11px] text-text-muted">Opportunities</p>
              </div>
              <div>
                <p className="text-[18px] font-bold text-text-primary">{company.contacts?.length || 0}</p>
                <p className="text-[11px] text-text-muted">Contacts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Interactions (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <InteractionLog interactions={(company.interactions || []).map((i: any) => ({ ...i, author: Array.isArray(i.author) ? i.author[0] : i.author }))} companyId={company.id} />

          {/* Opportunities */}
          {company.opportunities && company.opportunities.length > 0 && (
            <div className="bg-shell p-6 rounded-card border border-border-hairline shadow-sm">
              <h3 className="text-[16px] font-semibold text-text-primary mb-4">Opportunities</h3>
              <div className="space-y-3">
                {company.opportunities.map((opp: any) => (
                  <div key={opp.id} className="bg-surface p-4 rounded-[14px] border border-border-hairline">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-[14px] truncate">{opp.title}</p>
                        <p className="text-[12px] text-text-secondary mt-0.5">{opp.type || 'General'}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-pill text-[11px] font-medium flex-shrink-0 ${OPP_STAGE_COLORS[opp.stage] || 'bg-gray-100 text-gray-600'}`}>
                        {opp.stage}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-[12px] text-text-muted">
                      {opp.probability !== null && (
                        <span>{opp.probability}% probability</span>
                      )}
                      {opp.expected_close && (
                        <span>Close: {format(new Date(opp.expected_close), 'MMM d, yyyy')}</span>
                      )}
                      {opp.initiative_owner?.full_name && (
                        <span>Owner: {opp.initiative_owner.full_name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <CompanyResearchCard companyId={company.id} enrichment={company.enrichment || {}} status={company.enrichment_status || 'not_researched'} />
          <div className="bg-shell p-5 rounded-card border border-border-hairline shadow-sm">
            <h3 className="text-[15px] font-semibold text-text-primary mb-3">Placement profile</h3>
            <dl className="space-y-2 text-[12px]">
              {[["Sector", company.sector], ["Company type", company.company_type], ["India HQ", company.india_headquarters], ["State", company.state], ["RVU priority", company.rvu_priority], ["Hiring freshers", company.hiring_freshers == null ? null : company.hiring_freshers ? 'Yes' : 'No'], ["Internship program", company.internship_program == null ? null : company.internship_program ? 'Yes' : 'No'], ["Campus hiring", company.campus_hiring == null ? null : company.campus_hiring ? 'Yes' : 'No'], ["CTC range", company.ctc_range], ["Courses", company.courses_eligible], ["Typical roles", company.typical_roles], ["Verification", company.verification_status], ["Last verified", company.last_verified_at]].filter(([, value]) => value).map(([label, value]) => <div key={label as string} className="flex justify-between gap-3"><dt className="text-text-muted">{label}</dt><dd className="text-right text-text-primary break-words">{value as string}</dd></div>)}
            </dl>
          </div>
          {Object.keys(company.imported_data || {}).length > 0 && (
            <div className="bg-shell p-5 rounded-card border border-border-hairline shadow-sm">
              <h3 className="text-[15px] font-semibold text-text-primary mb-3">Imported company data</h3>
              <dl className="space-y-2 text-[12px]">
                {Object.entries(company.imported_data as Record<string, string>).map(([key, value]) => <div key={key} className="flex justify-between gap-3"><dt className="text-text-muted truncate">{key}</dt><dd className="text-text-primary text-right break-words">{value}</dd></div>)}
              </dl>
            </div>
          )}
          {/* Contacts */}
          <div className="bg-shell p-5 rounded-card border border-border-hairline shadow-sm">
            <h3 className="text-[15px] font-semibold text-text-primary mb-4">Contacts</h3>
            <div className="space-y-3">
              {company.contacts?.map((contact: any) => (
                <div key={contact.id} className="flex items-start gap-3 p-3 bg-surface rounded-[12px] border border-border-hairline">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                    {contact.first_name?.[0]}{contact.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary text-[13px] truncate">
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.role && (
                      <p className="text-[11px] text-text-secondary truncate mt-0.5">{contact.role}</p>
                    )}
                    <div className="flex flex-col gap-0.5 mt-1">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="text-[11px] text-blue-500 hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {contact.phone}
                        </span>
                      )}
                      {contact.linkedin && (
                        <a href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:underline truncate">
                          LinkedIn profile
                        </a>
                      )}
                      {Array.isArray(contact.additional_details) && contact.additional_details.map((detail: { label: string; value: string; type: string }, index: number) => {
                        const href = detail.type === 'email' ? `mailto:${detail.value}` : detail.type === 'phone' ? `tel:${detail.value}` : detail.type === 'linkedin' || detail.type === 'url' ? (detail.value.startsWith('http') ? detail.value : `https://${detail.value}`) : null
                        return href ? <a key={index} href={href} target={detail.type === 'email' || detail.type === 'phone' ? undefined : '_blank'} rel="noreferrer" className="text-[11px] text-blue-500 hover:underline truncate">{detail.label || detail.value}</a> : <span key={index} className="text-[11px] text-text-muted truncate">{detail.label}: {detail.value}</span>
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {(!company.contacts || company.contacts.length === 0) && (
                <p className="text-[12px] text-text-muted text-center py-3">No contacts yet</p>
              )}
            </div>
          </div>

          {/* Follow-ups */}
          <div className="bg-shell p-5 rounded-card border border-border-hairline shadow-sm">
            <h3 className="text-[15px] font-semibold text-text-primary mb-4">Follow-ups</h3>
            <div className="space-y-2">
              {company.followUps?.map((f: any) => {
                const isOverdue = f.due_date && new Date(f.due_date) < now && f.status !== 'Completed' && f.status !== 'Cancelled'
                return (
                  <div key={f.id} className={`p-3 rounded-[12px] border ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-surface border-border-hairline'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[13px] text-text-primary truncate">{f.title}</p>
                        {f.due_date && (
                          <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-text-muted'}`}>
                            <Clock className="w-3 h-3" />
                            {isOverdue ? 'Overdue · ' : ''}{format(new Date(f.due_date), 'MMM d')}
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-pill border flex-shrink-0 ${FOLLOW_UP_PRIORITY[f.priority] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {f.priority}
                      </span>
                    </div>
                  </div>
                )
              })}
              {(!company.followUps || company.followUps.length === 0) && (
                <p className="text-[12px] text-text-muted text-center py-3">No follow-ups yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
