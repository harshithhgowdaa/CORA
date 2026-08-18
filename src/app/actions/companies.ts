'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { withActionHandler } from '@/lib/actions-wrapper'
import { revalidatePath } from 'next/cache'
import { requireOrganizationMember, requirePermission } from '@/lib/authz'

// ============================================================
// GET ALL COMPANIES (list view)
// ============================================================
export const getCompanies = async (filters?: { status?: string; industry?: string; ownerId?: string }) => {
  return withActionHandler(async () => {
    const currentUser = await requireOrganizationMember()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const orgId = currentUser.orgId

    let query = supabase
      .from('companies')
      .select('id, name, industry, sector, company_type, status, website, headquarters, india_headquarters, state, rvu_priority, verification_status, hiring_freshers, internship_program, campus_hiring, tags, imported_data, enrichment, enrichment_status, created_at, updated_at')
      .eq('org_id', orgId)
      .order('name')

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.industry) query = query.eq('industry', filters.industry)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    // Fetch primary owners separately
    const companyIds = (data || []).map((c: any) => c.id)
    let owners: any[] = []
    if (companyIds.length > 0) {
      const { data: assignments } = await supabase
        .from('relationship_assignments')
        .select('company_id, users(id, full_name)')
        .in('company_id', companyIds)
        .eq('assignment_type', 'PRIMARY')
        .eq('is_active', true)
      owners = assignments || []
    }

    const mapped = (data || []).map((c: any) => ({
      ...c,
      primaryOwner: owners.find((a: any) => a.company_id === c.id)?.users || null,
    }))
    if (!filters?.ownerId) return mapped
    const matchingAssignments = await supabase.from('relationship_assignments').select('company_id').in('company_id', companyIds).eq('user_id', filters.ownerId).eq('is_active', true)
    const matchingIds = new Set((matchingAssignments.data || []).map((assignment: any) => assignment.company_id))
    return mapped.filter((company: any) => matchingIds.has(company.id))
  })
}

// ============================================================
// GET SINGLE COMPANY (360° view)
// ============================================================
export const getCompany = async (id: string) => {
  return withActionHandler(async () => {
    await requireOrganizationMember()
    const supabase = await createClient()

    // Basic company info
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, name, industry, sector, company_type, status, website, headquarters, india_headquarters, state, careers_url, linkedin_company_url, bengaluru_presence, rvu_priority, hiring_freshers, internship_program, graduate_programs, courses_eligible, typical_roles, hiring_months, ctc_range, campus_hiring, hiring_process, ats_platform, diversity_hiring, ppo_program, office_address, previous_recruitment, relevant_rvu_schools, existing_rvu_connect, evidence_url, last_verified_at, verification_status, public_recruitment_email, public_phone, hr_head_name, talent_acquisition_head_name, campus_recruitment_lead_name, recruiter_designation, recruiter_linkedin_url, ceo_name, founders, founded_year, notes, size, headquarters, description, tags, imported_data, enrichment, enrichment_status, enriched_at, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)

    // Parallel fetch of related data
    const [
      { data: contacts },
      { data: interactions },
      { data: assignments },
      { data: followUps },
      { data: opportunities },
    ] = await Promise.all([
      supabase.from('contacts').select('id, first_name, last_name, email, role, phone, linkedin, title, department, preferred_communication, is_primary, additional_details').eq('company_id', id).order('first_name'),
      supabase.from('interactions').select('id, type, notes, date, outcome, author:author_id(id, full_name)').eq('company_id', id).order('date', { ascending: false }).limit(30),
      supabase.from('relationship_assignments').select('id, assignment_type, is_active, start_date, users(id, full_name, role, email)').eq('company_id', id).eq('is_active', true),
      supabase.from('follow_ups').select('id, title, status, priority, due_date, officer_id, officer:officer_id(full_name)').eq('company_id', id).order('due_date', { ascending: true }),
      supabase.from('opportunities').select('id, title, type, stage, probability, expected_close, initiative_owner:initiative_owner_id(id, full_name)').eq('company_id', id).order('created_at', { ascending: false }),
    ])

    return {
      ...company,
      contacts: contacts || [],
      interactions: interactions || [],
      assignments: assignments || [],
      followUps: followUps || [],
      opportunities: opportunities || [],
    }
  })
}

// ============================================================
// CREATE COMPANY
// ============================================================
export const createCompany = async (formData: FormData) => {
  return withActionHandler(async () => {
    const currentUser = await requirePermission('write')
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('UNAUTHENTICATED: Not authenticated')

    const adminClient = await createAdminClient()
    if (!currentUser.orgId) throw new Error('UNAUTHENTICATED: No organization found for user. Please contact your administrator.')

    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: formData.get('name') as string,
        industry: formData.get('industry') as string || null,
        website: formData.get('website') as string || null,
        status: formData.get('status') as string || 'Prospect',
        notes: formData.get('notes') as string || null,
        org_id: currentUser.orgId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // If a primary owner is specified, create the assignment
    const ownerId = formData.get('primary_owner_id') as string
    if (ownerId) {
      await supabase.from('relationship_assignments').insert({
        company_id: data.id,
        user_id: ownerId,
        assignment_type: 'PRIMARY',
        org_id: currentUser.orgId,
        is_active: true,
      })
    }

    revalidatePath('/companies')
    revalidatePath('/')
    return data
  })
}

// ============================================================
// UPDATE COMPANY
// ============================================================
export const updateCompany = async (id: string, formData: FormData) => {
  return withActionHandler(async () => {
    await requirePermission('write')
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('companies')
      .update({
        name: formData.get('name') as string,
        industry: formData.get('industry') as string || null,
        website: formData.get('website') as string || null,
        status: formData.get('status') as string,
        notes: formData.get('notes') as string || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath(`/companies/${id}`)
    revalidatePath('/companies')
    revalidatePath('/')
    return data
  })
}

export const updateCompanyStatus = async (id: string, status: string) => {
  return withActionHandler(async () => {
    const currentUser = await requirePermission('write')
    const allowed = ['Prospect', 'Contacted', 'Meeting Scheduled', 'Discussion', 'Proposal', 'Negotiation', 'Partnership Signed', 'Active Partner', 'Dormant', 'Closed']
    if (!allowed.includes(status)) throw new Error('VALIDATION: Invalid relationship status')
    const supabase = await createClient()
    const { data, error } = await supabase.from('companies').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('org_id', currentUser.orgId).select('id, status').single()
    if (error) throw new Error(`DATABASE: ${error.message}`)
    revalidatePath(`/companies/${id}`, 'page'); revalidatePath('/', 'page'); revalidatePath('/companies', 'page')
    return data
  })
}

export const deleteCompany = async (companyId: string | string[]) => {
  return withActionHandler(async () => {
    const currentUser = await requirePermission('write')
    const admin = await createAdminClient()
    const ids = Array.isArray(companyId) ? companyId.filter(Boolean) : [companyId]
    if (ids.length === 0) return { id: '', count: 0 }

    // 1. Clear current_company_id references in alumni
    const { error: alumniError } = await admin
      .from('alumni')
      .update({ current_company_id: null })
      .in('current_company_id', ids)
      .eq('org_id', currentUser.orgId)
    if (alumniError) throw new Error(`DATABASE: ${alumniError.message}`)

    // 2. Delete follow_ups
    const { error: followUpError } = await admin
      .from('follow_ups')
      .delete()
      .in('company_id', ids)
      .eq('org_id', currentUser.orgId)
    if (followUpError) throw new Error(`DATABASE: ${followUpError.message}`)

    // 3. Delete interactions
    const { error: interactionError } = await admin
      .from('interactions')
      .delete()
      .in('company_id', ids)
      .eq('org_id', currentUser.orgId)
    if (interactionError) throw new Error(`DATABASE: ${interactionError.message}`)

    // 4. Delete opportunities
    const { error: oppError } = await admin
      .from('opportunities')
      .delete()
      .in('company_id', ids)
      .eq('org_id', currentUser.orgId)
    if (oppError) throw new Error(`DATABASE: ${oppError.message}`)

    // 5. Delete initiatives
    const { error: initError } = await admin
      .from('initiatives')
      .delete()
      .in('company_id', ids)
      .eq('org_id', currentUser.orgId)
    if (initError) throw new Error(`DATABASE: ${initError.message}`)

    // 6. Delete contacts
    const { error: contactError } = await admin
      .from('contacts')
      .delete()
      .in('company_id', ids)
      .eq('org_id', currentUser.orgId)
    if (contactError) throw new Error(`DATABASE: ${contactError.message}`)

    // 7. Delete relationship_assignments
    const { error: assignError } = await admin
      .from('relationship_assignments')
      .delete()
      .in('company_id', ids)
      .eq('org_id', currentUser.orgId)
    if (assignError) throw new Error(`DATABASE: ${assignError.message}`)

    // 8. Delete companies
    const { error } = await admin
      .from('companies')
      .delete()
      .in('id', ids)
      .eq('org_id', currentUser.orgId)
    if (error) throw new Error(`DATABASE: ${error.message}`)

    revalidatePath('/companies', 'page')
    revalidatePath('/', 'page')
    revalidatePath('/pipeline', 'page')
    revalidatePath('/follow-ups', 'page')
    return { id: ids[0], count: ids.length }
  })
}

// ============================================================
// ASSIGN OWNER
// ============================================================
export const assignOwner = async (companyId: string, userId: string, type: 'PRIMARY' | 'SUPPORT') => {
  return withActionHandler(async () => {
    const currentUser = await requirePermission('write')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('UNAUTHENTICATED: Not authenticated')

    const { data: targetUser } = await supabase.from('users').select('id').eq('id', userId).eq('org_id', currentUser.orgId).eq('is_active', true).single()
    if (!targetUser) throw new Error('VALIDATION: Selected owner is not in your organization')

    // If PRIMARY, deactivate existing primary first
    if (type === 'PRIMARY') {
      await supabase
        .from('relationship_assignments')
        .update({ is_active: false, end_date: new Date().toISOString() })
        .eq('company_id', companyId)
        .eq('assignment_type', 'PRIMARY')
        .eq('is_active', true)
    }

    const { data: existing } = await supabase.from('relationship_assignments').select('id').eq('company_id', companyId).eq('user_id', userId).eq('assignment_type', type).eq('is_active', true).maybeSingle()
    const { data, error } = existing
      ? await supabase.from('relationship_assignments').update({ start_date: new Date().toISOString(), end_date: null, is_active: true }).eq('id', existing.id).select().single()
      : await supabase.from('relationship_assignments').insert({
        company_id: companyId,
        user_id: userId,
        assignment_type: type,
        org_id: currentUser.orgId,
        is_active: true,
        start_date: new Date().toISOString(),
      }).select().single()

    if (error) throw new Error(error.message)

    revalidatePath(`/companies/${companyId}`)
    revalidatePath('/', 'page')
    revalidatePath('/pipeline', 'page')
    return data
  })
}

export const removeOwner = async (assignmentId: string, companyId: string) => {
  return withActionHandler(async () => {
    const currentUser = await requirePermission('write')
    const supabase = await createClient()
    const { error } = await supabase.from('relationship_assignments').update({ is_active: false, end_date: new Date().toISOString() }).eq('id', assignmentId).eq('company_id', companyId).eq('org_id', currentUser.orgId)
    if (error) throw new Error(`DATABASE: ${error.message}`)
    revalidatePath(`/companies/${companyId}`, 'page'); revalidatePath('/', 'page')
    return { id: assignmentId }
  })
}

// ============================================================
// GET TEAM MEMBERS (for dropdowns)
// ============================================================
export const getTeamMembers = async () => {
  return withActionHandler(async () => {
    const currentUser = await requireOrganizationMember()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('UNAUTHENTICATED: Not authenticated')

    if (!currentUser.orgId) return []

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role, email')
      .eq('org_id', currentUser.orgId)
      .eq('is_active', true)
      .order('full_name')

    if (error) throw new Error(error.message)
    return data || []
  })
}
