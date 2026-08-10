'use server'

import { createClient } from '@/lib/supabase/server'
import { requireOrganizationMember } from '@/lib/authz'
import { withActionHandler } from '@/lib/actions-wrapper'
import { checkRateLimit } from '@/lib/rate-limit'

export interface SearchResult { type: 'company' | 'contact' | 'officer' | 'opportunity' | 'interaction' | 'follow_up'; id: string; title: string; subtitle: string | null; href: string }

export const fullTextSearch = async (query: string) => withActionHandler(async () => {
  const user = await requireOrganizationMember()
  const rate = checkRateLimit(`search:${user.id}`, 60, 60_000)
  if (!rate.allowed) throw new Error('CONFLICT: Search rate limit reached. Try again shortly.')
  const supabase = await createClient()
  const term = query.trim().replace(/[%_,()]/g, ' ').slice(0, 100)
  if (term.length < 2) return [] as SearchResult[]
  const like = `%${term}%`
  const [companies, contacts, officers, opportunities, interactions, followUps] = await Promise.all([
    supabase.from('companies').select('id, name, industry').eq('org_id', user.orgId).ilike('name', like).limit(5),
    supabase.from('contacts').select('id, first_name, last_name, role, company_id').eq('org_id', user.orgId).or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`).limit(5),
    supabase.from('users').select('id, full_name, email, role').eq('org_id', user.orgId).or(`full_name.ilike.${like},email.ilike.${like}`).limit(5),
    supabase.from('opportunities').select('id, title, type, company_id').eq('org_id', user.orgId).ilike('title', like).limit(5),
    supabase.from('interactions').select('id, notes, type, company_id').eq('org_id', user.orgId).ilike('notes', like).limit(5),
    supabase.from('follow_ups').select('id, title, company_id, status').eq('org_id', user.orgId).ilike('title', like).limit(5),
  ])
  const result: SearchResult[] = []
  for (const row of companies.data ?? []) result.push({ type: 'company', id: row.id, title: row.name, subtitle: row.industry, href: `/companies/${row.id}` })
  for (const row of contacts.data ?? []) result.push({ type: 'contact', id: row.id, title: `${row.first_name} ${row.last_name}`.trim(), subtitle: row.role, href: `/companies/${row.company_id}` })
  for (const row of officers.data ?? []) result.push({ type: 'officer', id: row.id, title: row.full_name, subtitle: row.role, href: `/companies?owner=${row.id}` })
  for (const row of opportunities.data ?? []) result.push({ type: 'opportunity', id: row.id, title: row.title, subtitle: row.type, href: `/companies/${row.company_id}` })
  for (const row of interactions.data ?? []) result.push({ type: 'interaction', id: row.id, title: row.notes.slice(0, 100), subtitle: row.type, href: `/companies/${row.company_id}` })
  for (const row of followUps.data ?? []) result.push({ type: 'follow_up', id: row.id, title: row.title, subtitle: row.status, href: `/companies/${row.company_id}` })
  return result
})
