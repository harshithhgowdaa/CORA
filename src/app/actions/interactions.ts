'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { withActionHandler } from '@/lib/actions-wrapper'
import { revalidatePath } from 'next/cache'
import { requirePermission, requireOrganizationMember } from '@/lib/authz'

export const createInteraction = async (formData: FormData) => {
  return withActionHandler(async () => {
    const currentUser = await requirePermission('write')
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Not authenticated')

    const adminClient = await createAdminClient()
    const { data: userData } = await adminClient
      .from('users').select('org_id').eq('id', user.id).single()
    if (!userData?.org_id) throw new Error('No organization found for user')

    const dateStr = formData.get('date') as string
    const date = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        type: formData.get('type') as string,
        notes: formData.get('notes') as string,
        date,
        outcome: formData.get('outcome') as string || null,
        company_id: formData.get('company_id') as string || null,
        alumni_id: formData.get('alumni_id') as string || null,
        contact_id: formData.get('contact_id') as string || null,
        author_id: currentUser.id,
        org_id: currentUser.orgId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    const companyId = formData.get('company_id') as string
    if (companyId) {
      revalidatePath(`/companies/${companyId}`)
      // Update company updated_at
      await supabase.from('companies').update({ updated_at: new Date().toISOString() }).eq('id', companyId)
    }
    revalidatePath('/')
    return data
  })
}

export const getInteractions = async (filters?: { company_id?: string; alumni_id?: string }) => {
  return withActionHandler(async () => {
    const currentUser = await requireOrganizationMember()
    const supabase = await createClient()

    let query = supabase
      .from('interactions')
      .select('id, type, notes, date, outcome, company_id, author:author_id(id, full_name)')
      .eq('org_id', currentUser.orgId)
      .order('date', { ascending: false })

    if (filters?.company_id) query = query.eq('company_id', filters.company_id)
    if (filters?.alumni_id) query = query.eq('alumni_id', filters.alumni_id)

    const { data, error } = await query.limit(50)
    if (error) throw new Error(error.message)
    return data || []
  })
}
