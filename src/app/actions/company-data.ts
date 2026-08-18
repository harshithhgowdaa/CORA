'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { withActionHandler } from '@/lib/actions-wrapper'
import { requirePermission } from '@/lib/authz'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

const scalar = z.string().trim().max(4000).optional().nullable()
const importRowSchema = z.object({
  name: z.string().trim().min(1).max(200), external_key: scalar, industry: scalar, website: scalar,
  status: scalar, size: scalar, headquarters: scalar, description: scalar, notes: scalar,
  sector: scalar, company_type: scalar, india_headquarters: scalar, state: scalar, careers_url: scalar, linkedin_company_url: scalar,
  bengaluru_presence: scalar, rvu_priority: scalar, hiring_freshers: scalar, internship_program: scalar, graduate_programs: scalar,
  courses_eligible: scalar, typical_roles: scalar, hiring_months: scalar, ctc_range: scalar, campus_hiring: scalar, hiring_process: scalar,
  ats_platform: scalar, diversity_hiring: scalar, ppo_program: scalar, office_address: scalar, previous_recruitment: scalar, relevant_rvu_schools: scalar,
  existing_rvu_connect: scalar, evidence_url: scalar, last_verified_at: scalar, verification_status: scalar, public_recruitment_email: scalar,
  public_phone: scalar, hr_head_name: scalar, talent_acquisition_head_name: scalar, campus_recruitment_lead_name: scalar, recruiter_designation: scalar,
  recruiter_linkedin_url: scalar, ceo_name: scalar, founders: scalar, founded_year: scalar,
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  imported_data: z.record(z.string().max(160), z.string().max(4000)).default({}),
})
const importSchema = z.object({ fileName: z.string().trim().min(1).max(255), rows: z.array(importRowSchema).min(1).max(500) })
const sourceSchema = z.object({ label: z.string().trim().min(1).max(160), url: z.string().url().max(2000) })
const enrichmentSchema = z.object({ ceo: scalar, founders: z.array(z.string().trim().min(1).max(160)).max(20).default([]), foundingYear: z.coerce.number().int().min(1000).max(new Date().getFullYear()).nullable().optional(), sources: z.array(sourceSchema).max(20).default([]), status: z.enum(['not_researched', 'needs_review', 'verified', 'stale']) })
const companyIdSchema = z.string().uuid()

export const importMappedCompanies = async (input: z.infer<typeof importSchema>) => withActionHandler(async () => {
  const user = await requirePermission('write')
  const parsed = importSchema.parse(input)
  if (JSON.stringify(parsed).length > 900_000) throw new Error('VALIDATION: Import data is too large. Split the file into smaller batches.')
  const booleanFields = ['bengaluru_presence', 'hiring_freshers', 'internship_program', 'campus_hiring', 'diversity_hiring', 'ppo_program'] as const
  const urlFields = ['website', 'careers_url', 'linkedin_company_url', 'evidence_url', 'recruiter_linkedin_url'] as const
  const relationshipStatuses = new Set(['Prospect', 'Contacted', 'Meeting Scheduled', 'Discussion', 'Proposal', 'Negotiation', 'Partnership Signed', 'Active Partner', 'Dormant', 'Closed'])
  const verificationStatuses: Record<string, string> = { unverified: 'unverified', pending: 'pending_review', pendingreview: 'pending_review', verified: 'verified', stale: 'stale' }
  const rows = parsed.rows.map((row, index) => {
    const next: Record<string, unknown> = { ...row }
    for (const field of booleanFields) {
      const value = next[field]
      if (typeof value !== 'string' || !value.trim()) continue
      const normalized = value.trim().toLowerCase()
      if (['yes', 'y', 'true', '1'].includes(normalized)) next[field] = 'true'
      else if (['no', 'n', 'false', '0'].includes(normalized)) next[field] = 'false'
      else throw new Error(`VALIDATION: Row ${index + 2}, ${field.replaceAll('_', ' ')} must be Yes or No`)
    }
    for (const field of urlFields) {
      const value = next[field]
      if (typeof value !== 'string' || !value.trim()) continue
      try { const url = new URL(value.startsWith('http') ? value : `https://${value}`); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); next[field] = url.toString() } catch { throw new Error(`VALIDATION: Row ${index + 2}, ${field.replaceAll('_', ' ')} must be a valid URL`) }
    }
    if (typeof next.status === 'string' && next.status && !relationshipStatuses.has(next.status)) throw new Error(`VALIDATION: Row ${index + 2}, relationship status is invalid. Use a CRM pipeline status such as Prospect or Contacted`)
    if (typeof next.verification_status === 'string' && next.verification_status) {
      const normalized = next.verification_status.toLowerCase().replace(/[^a-z]/g, '')
      const status = verificationStatuses[normalized]
      if (!status) throw new Error(`VALIDATION: Row ${index + 2}, verification status must be Unverified, Pending Review, Verified, or Stale`)
      next.verification_status = status
    }
    if (typeof next.last_verified_at === 'string' && next.last_verified_at) {
      const date = new Date(next.last_verified_at)
      if (Number.isNaN(date.getTime())) throw new Error(`VALIDATION: Row ${index + 2}, last verified must be a valid date`)
      next.last_verified_at = date.toISOString().slice(0, 10)
    }
    if (typeof next.founded_year === 'string' && next.founded_year && !/^(18|19|20)\d{2}$/.test(next.founded_year)) throw new Error(`VALIDATION: Row ${index + 2}, founded year must be a four-digit year`)
    return next
  })
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('import_company_rows', { p_file_name: parsed.fileName, p_rows: rows })
  if (error) {
    if (/import_company_rows|function.*does not exist|schema cache/i.test(error.message)) throw new Error('VALIDATION: Company-import database setup is missing. Apply Supabase migration 20260817000000 and 20260818000000, then retry.')
    throw new Error(`DATABASE: ${error.message}`)
  }
  revalidatePath('/companies'); revalidatePath('/')
  return data?.[0] ?? { inserted_count: 0, updated_count: 0, skipped_count: 0, job_id: null, orgId: user.orgId }
})

export const saveCompanyEnrichment = async (companyId: string, input: z.infer<typeof enrichmentSchema>) => withActionHandler(async () => {
  const user = await requirePermission('write')
  const id = companyIdSchema.parse(companyId)
  const parsed = enrichmentSchema.parse(input)
  const supabase = await createClient()
  const enrichment = { ceo: parsed.ceo || null, founders: parsed.founders, foundingYear: parsed.foundingYear || null, sources: parsed.sources, verifiedAt: parsed.status === 'verified' ? new Date().toISOString() : null }
  const { data, error } = await supabase.from('companies').update({ enrichment, enrichment_status: parsed.status, enriched_at: new Date().toISOString() }).eq('id', id).eq('org_id', user.orgId).select('id').maybeSingle()
  if (error) throw new Error(`DATABASE: ${error.message}`)
  if (!data) throw new Error('NOT_FOUND: Company not found')
  revalidatePath(`/companies/${id}`); revalidatePath('/companies')
  return enrichment
})

function isUnsafeHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return host === 'localhost' || host.endsWith('.localhost') || /^127\.|^10\.|^192\.168\.|^0\.|^169\.254\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(host) || host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:') || host.startsWith('::ffff:')
}

function publicHttpsUrl(value: string) {
  const url = new URL(value.startsWith('http') ? value : `https://${value}`)
  if (url.protocol !== 'https:' || isUnsafeHost(url.hostname)) throw new Error('VALIDATION: Only public HTTPS company websites can be researched')
  return url
}

export const researchCompanyWebsite = async (companyId: string) => withActionHandler(async () => {
  const user = await requirePermission('write')
  const id = companyIdSchema.parse(companyId)
  const rate = checkRateLimit(`company-research:${user.id}`, 10, 60_000)
  if (!rate.allowed) throw new Error(`VALIDATION: Try research again in ${rate.retryAfterSeconds} seconds`)
  const supabase = await createClient()
  const { data: company, error } = await supabase.from('companies').select('name, website').eq('id', id).eq('org_id', user.orgId).single()
  if (error || !company) throw new Error('NOT_FOUND: Company not found')
  if (!company.website) throw new Error('VALIDATION: Add the company website before researching')
  let url: URL
  try { url = publicHttpsUrl(company.website) } catch (error) { if (error instanceof TypeError) throw new Error('VALIDATION: Company website is not a valid URL'); throw error }
  let response: Response | undefined
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'CORA-CRM-Research/1.0' } })
    if (response.status < 300 || response.status >= 400) break
    const location = response.headers.get('location')
    if (!location) throw new Error('VALIDATION: The company website returned an invalid redirect')
    try { url = publicHttpsUrl(new URL(location, url).toString()) } catch (error) { if (error instanceof TypeError) throw new Error('VALIDATION: The company website returned an invalid redirect'); throw error }
  }
  if (!response || response.status >= 300 && response.status < 400) throw new Error('VALIDATION: The company website redirected too many times')
  if (!response.ok) throw new Error('VALIDATION: The company website could not be reached')
  const html = (await response.text()).slice(0, 750_000)
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, ' ').replace(/\s+/g, ' ')
  const year = text.match(/(?:founded|established|since)\D{0,20}(18\d{2}|19\d{2}|20\d{2})/i)?.[1]
  const ceo = text.match(/(?:CEO|chief executive officer)\s*[:,-]?\s*([A-Z][A-Za-z .'-]{2,80})/)?.[1]?.trim()
  const founders = [...text.matchAll(/(?:founded by|founder)\s*[:,-]?\s*([A-Z][A-Za-z .,'&-]{2,160})/gi)].map(match => match[1].split(/(?:,| and | & )/).map(name => name.trim()).filter(Boolean)).flat().slice(0, 10)
  return { ceo: ceo || null, founders: [...new Set(founders)], foundingYear: year ? Number(year) : null, sources: [{ label: `${company.name} website`, url: url.toString() }], status: 'needs_review' as const }
})
