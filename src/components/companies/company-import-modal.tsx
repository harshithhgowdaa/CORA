'use client'

import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
import { importMappedCompanies } from '@/app/actions/company-data'

const fields = [
  ['name', 'Company name *'], ['external_key', 'External ID / key'], ['industry', 'Industry'], ['sector', 'Sector'], ['company_type', 'Company type'], ['website', 'Official website'], ['headquarters', 'Global headquarters'], ['india_headquarters', 'India HQ / primary city'], ['state', 'State'], ['careers_url', 'Careers page URL'], ['linkedin_company_url', 'LinkedIn company URL'], ['bengaluru_presence', 'Bengaluru presence (Yes/No)'], ['rvu_priority', 'RVU priority'], ['hiring_freshers', 'Hiring freshers (Yes/No)'], ['internship_program', 'Internship program (Yes/No)'], ['graduate_programs', 'Graduate programs'], ['courses_eligible', 'Courses eligible'], ['typical_roles', 'Typical roles'], ['hiring_months', 'Hiring months'], ['ctc_range', 'CTC range'], ['campus_hiring', 'Campus hiring (Yes/No)'], ['hiring_process', 'Hiring process'], ['ats_platform', 'ATS platform'], ['diversity_hiring', 'Diversity hiring (Yes/No)'], ['ppo_program', 'PPO program (Yes/No)'], ['hr_head_name', 'HR head'], ['talent_acquisition_head_name', 'Talent acquisition head'], ['campus_recruitment_lead_name', 'Campus recruitment lead'], ['public_recruitment_email', 'Public recruitment email'], ['recruiter_linkedin_url', 'Public recruiter LinkedIn'], ['public_phone', 'Public phone'], ['office_address', 'Office address'], ['previous_recruitment', 'Previous RVU recruitment'], ['relevant_rvu_schools', 'Relevant RVU schools'], ['existing_rvu_connect', 'Existing RVU/RVCE connect'], ['notes', 'Remarks / notes'], ['ceo_name', 'CEO'], ['founders', 'Founders'], ['founded_year', 'Founded year'], ['evidence_url', 'Source / evidence URL'], ['last_verified_at', 'Last verified date'], ['verification_status', 'Verification status'], ['status', 'Relationship status'], ['keep', 'Keep as custom field'], ['ignore', 'Ignore column'],
] as const
type Target = (typeof fields)[number][0]
type RawRow = Record<string, string>

function suggestedTarget(header: string): Target {
  const key = header.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (/^(company|companyname|name|organisation|organization)$/.test(key)) return 'name'
  if (/^(id|companyid|externalid|companycode)$/.test(key)) return 'external_key'
  const aliases: Record<string, Target> = { industry: 'industry', sector: 'sector', segment: 'sector', companytype: 'company_type', website: 'website', officialwebsite: 'website', careerspage: 'careers_url', careersurl: 'careers_url', linkedincompanypage: 'linkedin_company_url', linkedincompanyurl: 'linkedin_company_url', headquarters: 'headquarters', globalhq: 'headquarters', hqprimarycity: 'india_headquarters', indiahq: 'india_headquarters', state: 'state', bengalurupresence: 'bengaluru_presence', rvupriority: 'rvu_priority', hiringfreshers: 'hiring_freshers', internshipprogram: 'internship_program', graduateprograms: 'graduate_programs', courseseligible: 'courses_eligible', typicalroles: 'typical_roles', hiringmonths: 'hiring_months', ctcrange: 'ctc_range', campushiring: 'campus_hiring', hiringprocess: 'hiring_process', atsplatform: 'ats_platform', diversityhiring: 'diversity_hiring', ppoprogram: 'ppo_program', hrhead: 'hr_head_name', talentacquisitionhead: 'talent_acquisition_head_name', campusrecruitmentlead: 'campus_recruitment_lead_name', hremail: 'public_recruitment_email', recruitmentemail: 'public_recruitment_email', publicrecruitmentemail: 'public_recruitment_email', linkedinprofile: 'recruiter_linkedin_url', publiclinkedinprofile: 'recruiter_linkedin_url', phone: 'public_phone', publicphonecontact: 'public_phone', officeaddress: 'office_address', previousrecruitment: 'previous_recruitment', existingrvurvceconnect: 'existing_rvu_connect', relevantrvuschools: 'relevant_rvu_schools', likelyrolesforrvustudents: 'typical_roles', remarks: 'notes', notes: 'notes', ceo: 'ceo_name', foundersandwhenfounded: 'founders', sourceevidenceurl: 'evidence_url', lastverified: 'last_verified_at', verificationstatus: 'verification_status', relationshipstatus: 'status' }
  if (aliases[key]) return aliases[key]
  if (key.includes('url')) return 'keep'
  return 'keep'
}

export function CompanyImportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<RawRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, Target>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const preview = useMemo(() => rows.slice(0, 5), [rows])
  if (!isOpen) return null

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) { setError('Choose an .xlsx, .xls, or .csv file.'); return }
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array', raw: false })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      if (!sheet) { setError('The workbook does not contain a readable first worksheet.'); return }
      const parsed = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '', raw: false })
      const fileHeaders = Object.keys(parsed[0] || {})
      if (!fileHeaders.length || !parsed.length) { setError('The first sheet needs a header row and at least one data row.'); return }
      if (parsed.length > 500) { setError('Import up to 500 rows at a time.'); return }
      setFileName(file.name); setRows(parsed); setHeaders(fileHeaders); setMapping(Object.fromEntries(fileHeaders.map(header => [header, suggestedTarget(header)])))
    } catch {
      setError('The file could not be read. Check that it is a valid spreadsheet or CSV file.')
    }
  }
  const submit = async () => {
    if (!headers.some(header => mapping[header] === 'name')) { setError('Map one spreadsheet column to Company name.'); return }
    setLoading(true); setError(null)
    const normalized = rows.map(row => {
      const result: Record<string, unknown> = { imported_data: {}, tags: [] }
      headers.forEach(header => {
        const value = row[header]?.trim() || ''
        const target = mapping[header]
        if (!value || target === 'ignore') return
        if (target === 'keep') (result.imported_data as Record<string, string>)[header] = value
        else result[target] = value
      })
      return result
    }).filter(row => typeof row.name === 'string' && row.name)
    if (!normalized.length) { setLoading(false); setError('No valid rows remain after mapping. Every imported row needs a company name.'); return }
    const response = await importMappedCompanies({ fileName, rows: normalized as never[] })
    setLoading(false)
    if (!response.success) { setError(response.error); return }
    window.alert(`Import complete: ${response.data.inserted_count} added, ${response.data.updated_count} updated, ${response.data.skipped_count} skipped.`)
    onClose(); window.location.reload()
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-app/80 p-4 backdrop-blur-sm"><div className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-shell border border-border-hairline bg-shell p-6 shadow-lg"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-lg font-semibold">Import company database</h2><p className="mt-1 text-xs text-text-secondary">Map columns once. Unmapped fields are retained as filterable custom data; matching company IDs or names update existing records without overwriting blanks.</p></div><button onClick={onClose} className="rounded-full p-2 text-text-muted hover:bg-subtle"><X className="h-4 w-4" /></button></div>{error && <p className="mb-4 rounded-cell border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}<label className="flex cursor-pointer items-center justify-center gap-2 rounded-card border border-dashed border-blue-300 bg-blue-50/40 px-5 py-7 text-sm text-blue-700"><FileSpreadsheet className="h-5 w-5" /><span>{fileName || 'Choose XLSX, XLS, or CSV file'}</span><input type="file" accept=".xlsx,.xls,.csv" onChange={event => onFile(event.target.files?.[0])} className="hidden" /></label>{headers.length > 0 && <><div className="mt-5 grid gap-2 md:grid-cols-2">{headers.map(header => <label key={header} className="grid grid-cols-2 items-center gap-2 rounded-cell border border-border-hairline p-2 text-xs"><span className="truncate font-medium" title={header}>{header}</span><select value={mapping[header]} onChange={event => setMapping(current => ({ ...current, [header]: event.target.value as Target }))} className="rounded border border-border-hairline bg-shell p-1">{fields.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div><div className="mt-5 overflow-x-auto rounded-card border border-border-hairline"><table className="w-full text-left text-xs"><thead><tr>{headers.map(header => <th key={header} className="bg-surface px-3 py-2">{header}</th>)}</tr></thead><tbody>{preview.map((row, index) => <tr key={index} className="border-t border-border-hairline">{headers.map(header => <td key={header} className="max-w-40 truncate px-3 py-2">{row[header]}</td>)}</tr>)}</tbody></table></div><div className="mt-5 flex justify-end"><button disabled={loading} onClick={submit} className="flex items-center gap-2 rounded-pill bg-blue-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-70">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Import {rows.length} companies</button></div></>}</div></div>
}
