'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { withActionHandler } from '@/lib/actions-wrapper'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/authz'

export const createContact = async (formData: FormData) => {
  return withActionHandler(async () => {
    const currentUser = await requirePermission('write')
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Not authenticated')

    const adminClient = await createAdminClient()
    const { data: userData } = await adminClient
      .from('users').select('org_id').eq('id', user.id).single()
    if (!userData?.org_id) throw new Error('No organization found for user')

    const companyId = formData.get('company_id') as string
    if (!companyId) throw new Error('Company ID is required')

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string || '',
        email: formData.get('email') as string || null,
        role: formData.get('role') as string || null,
        phone: formData.get('phone') as string || null,
        linkedin: formData.get('linkedin') as string || null,
        company_id: companyId,
        org_id: currentUser.orgId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath(`/companies/${companyId}`)
    return data
  })
}

export const updateContact = async (id: string, formData: FormData) => {
  return withActionHandler(async () => {
    await requirePermission('write')
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .update({
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string || '',
        email: formData.get('email') as string || null,
        role: formData.get('role') as string || null,
        phone: formData.get('phone') as string || null,
        linkedin: formData.get('linkedin') as string || null,
      })
      .eq('id', id)
      .select('id, company_id')
      .single()

    if (error) throw new Error(error.message)
    if (data.company_id) revalidatePath(`/companies/${data.company_id}`)
    return data
  })
}
