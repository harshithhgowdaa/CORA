'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { withActionHandler } from '@/lib/actions-wrapper'
import { revalidatePath } from 'next/cache'
import { requirePermission, requireOrganizationMember } from '@/lib/authz'

export const createFollowUp = async (formData: FormData) => {
  return withActionHandler(async () => {
    const currentUser = await requirePermission('write')
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Not authenticated')

    const adminClient = await createAdminClient()
    const { data: userData } = await adminClient
      .from('users').select('org_id').eq('id', user.id).single()
    if (!userData?.org_id) throw new Error('No organization found for user')

    const dateStr = formData.get('due_date') as string
    const dueDate = dateStr ? new Date(dateStr).toISOString() : null

    const officerId = formData.get('officer_id') as string || currentUser.id
    const companyId = formData.get('company_id') as string || null

    const { data, error } = await supabase
      .from('follow_ups')
      .insert({
        title: formData.get('title') as string,
        status: 'Pending',
        priority: formData.get('priority') as string || 'Medium',
        due_date: dueDate,
        company_id: companyId,
        officer_id: officerId,
        org_id: currentUser.orgId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/')
    if (companyId) revalidatePath(`/companies/${companyId}`)
    revalidatePath('/follow-ups')
    return data
  })
}

export const updateFollowUpStatus = async (id: string, status: string) => {
  return withActionHandler(async () => {
    await requirePermission('write')
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('follow_ups')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/')
    revalidatePath('/follow-ups')
    return data
  })
}

export const getFollowUps = async (filters?: { status?: string; priority?: string; company_id?: string; officer_id?: string }) => {
  return withActionHandler(async () => {
    const currentUser = await requireOrganizationMember()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const adminClient = await createAdminClient()
    const { data: userData } = await adminClient.from('users').select('org_id').eq('id', user.id).single()

    let query = supabase
      .from('follow_ups')
      .select('id, title, status, priority, due_date, company_id, officer_id, officer:officer_id(full_name)')
      .eq('org_id', currentUser.orgId)
      .order('due_date', { ascending: true })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.priority) query = query.eq('priority', filters.priority)
    if (filters?.company_id) query = query.eq('company_id', filters.company_id)
    if (filters?.officer_id) query = query.eq('officer_id', filters.officer_id)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    // Get company names
    const companyIds = [...new Set((data || []).map((f: any) => f.company_id).filter(Boolean))]
    let companies: any[] = []
    if (companyIds.length > 0) {
      const { data: compData } = await supabase
        .from('companies').select('id, name').in('id', companyIds)
      companies = compData || []
    }

    return (data || []).map((f: any) => ({
      ...f,
      companyName: companies.find((c: any) => c.id === f.company_id)?.name || null,
    }))
  })
}
