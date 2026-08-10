'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { withActionHandler } from '@/lib/actions-wrapper'
import { revalidatePath } from 'next/cache'
import { requirePermission, requireOrganizationMember } from '@/lib/authz'

export const createOpportunity = async (formData: FormData) => {
  return withActionHandler(async () => {
    const currentUser = await requirePermission('write')
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Not authenticated')

    const adminClient = await createAdminClient()
    if (!currentUser.orgId) throw new Error('UNAUTHENTICATED: No organization found for user')

    const companyId = formData.get('company_id') as string
    if (!companyId) throw new Error('Company ID is required')

    const probStr = formData.get('probability') as string
    const probability = probStr ? parseInt(probStr) : null

    const closeDateStr = formData.get('expected_close') as string
    const expectedClose = closeDateStr || null

    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        company_id: companyId,
        title: formData.get('title') as string,
        type: formData.get('type') as string || null,
        stage: formData.get('stage') as string || 'Prospect',
        probability,
        expected_close: expectedClose,
        initiative_owner_id: formData.get('initiative_owner_id') as string || null,
        org_id: currentUser.orgId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath(`/companies/${companyId}`, 'page')
    revalidatePath('/pipeline', 'page')
    revalidatePath('/', 'page')
    return data
  })
}

export const updateOpportunityStage = async (id: string, stage: string) => {
  return withActionHandler(async () => {
    await requirePermission('write')
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('opportunities')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, company_id')
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/pipeline', 'page')
    if (data.company_id) revalidatePath(`/companies/${data.company_id}`, 'page')
    revalidatePath('/', 'page')
    return data
  })
}

export const getOpportunities = async (filters?: { stage?: string; type?: string }) => {
  return withActionHandler(async () => {
    const currentUser = await requireOrganizationMember()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let query = supabase
      .from('opportunities')
      .select('id, title, type, stage, probability, expected_close, company_id, initiative_owner_id, companies:company_id(name)')
      .eq('org_id', currentUser.orgId)
      .order('created_at', { ascending: false })

    if (filters?.stage) query = query.eq('stage', filters.stage)
    if (filters?.type) query = query.eq('type', filters.type)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    // Get company names and owner names separately
    const companyIds = [...new Set((data || []).map((o: any) => o.company_id).filter(Boolean))]
    const ownerIds = [...new Set((data || []).map((o: any) => o.initiative_owner_id).filter(Boolean))]

    const [companiesRes, ownersRes] = await Promise.all([
      companyIds.length > 0
        ? supabase.from('companies').select('id, name').in('id', companyIds)
        : Promise.resolve({ data: [] }),
      ownerIds.length > 0
        ? supabase.from('users').select('id, full_name').in('id', ownerIds)
        : Promise.resolve({ data: [] }),
    ])

    const companies = companiesRes.data || []
    const owners = ownersRes.data || []

    return (data || []).map((o: any) => ({
      ...o,
      companyName: (Array.isArray(o.companies) ? o.companies[0]?.name : o.companies?.name) || companies.find((c: any) => c.id === o.company_id)?.name || null,
      ownerName: owners.find((u: any) => u.id === o.initiative_owner_id)?.full_name || null,
    }))
  })
}
