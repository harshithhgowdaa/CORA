'use server'

import { createClient } from '@/lib/supabase/server'
import { withActionHandler } from '@/lib/actions-wrapper'
import { revalidatePath } from 'next/cache'

export const getAlumni = async () => {
  return withActionHandler(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('alumni')
      .select('*, companies(name)')
      .order('first_name')

    if (error) throw new Error(error.message)
    return data
  })
}

export const getAlumnus = async (id: string) => {
  return withActionHandler(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('alumni')
      .select(`
        *,
        companies(name, industry),
        interactions(*, author:users(full_name))
      `)
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data
  })
}

export const createAlumnus = async (formData: FormData) => {
  return withActionHandler(async () => {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Not authenticated')

    const { data: userData } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()
      
    if (!userData?.org_id) throw new Error('No organization found for user')

    const companyIdStr = formData.get('current_company_id') as string
    const graduationYearStr = formData.get('graduation_year') as string

    const { data, error } = await supabase
      .from('alumni')
      .insert({
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: formData.get('email') as string,
        current_company_id: companyIdStr || null,
        graduation_year: graduationYearStr ? parseInt(graduationYearStr) : null,
        org_id: userData.org_id
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    
    // We would trigger embedding generation here or via webhook
    
    revalidatePath('/alumni')
    return data
  })
}
