'use server'

import { createAdminClient } from '../../lib/supabase/server'
import { withActionHandler } from '../../lib/actions-wrapper'
import { requireRole } from '@/lib/authz'
import type { Role } from '@/lib/domain'
import { revalidatePath } from 'next/cache'

export interface AccessRequest { id: string; auth_user_id: string; email: string; full_name: string; status: 'pending' | 'approved' | 'denied'; requested_role: Role; created_at: string }
export interface ManagedUser { id: string; email: string; full_name: string; role: Role; is_active: boolean }

export const getAdminOverview = async () => withActionHandler(async () => {
  const current = await requireRole(['admin']); const admin = await createAdminClient()
  const [{ data: requests, error: requestsError }, { data: users, error: usersError }] = await Promise.all([
    admin.from('access_requests').select('id, auth_user_id, email, full_name, status, requested_role, created_at').eq('org_id', current.orgId).order('created_at', { ascending: false }),
    admin.from('users').select('id, email, full_name, role, is_active').eq('org_id', current.orgId).order('full_name'),
  ])
  if (requestsError || usersError) throw new Error(`DATABASE: ${(requestsError || usersError)?.message}`)
  return { requests: (requests || []) as AccessRequest[], users: (users || []) as ManagedUser[] }
})

export const approveAccessRequest = async (requestId: string, role: Role = 'officer') => withActionHandler(async () => {
  const current = await requireRole(['admin']); const admin = await createAdminClient()
  const { data: request, error: requestError } = await admin.from('access_requests').select('auth_user_id, org_id, email, full_name').eq('id', requestId).eq('org_id', current.orgId).single()
  if (requestError || !request) throw new Error('NOT_FOUND: Access request not found')
  const { error: userError } = await admin.from('users').upsert({ id: request.auth_user_id, org_id: request.org_id, email: request.email, full_name: request.full_name, role, is_active: true }, { onConflict: 'id' })
  if (userError) throw new Error(`DATABASE: ${userError.message}`)
  const { error } = await admin.from('access_requests').update({ status: 'approved', requested_role: role, reviewed_by: current.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', requestId).eq('org_id', current.orgId)
  if (error) throw new Error(`DATABASE: ${error.message}`); revalidatePath('/profile'); return { id: requestId }
})

export const denyAccessRequest = async (requestId: string) => withActionHandler(async () => {
  const current = await requireRole(['admin']); const admin = await createAdminClient()
  const { data: request } = await admin.from('access_requests').select('auth_user_id').eq('id', requestId).eq('org_id', current.orgId).maybeSingle()
  if (!request) throw new Error('NOT_FOUND: Access request not found')
  await deactivateUserAndAssignments(admin, request.auth_user_id, current.orgId)
  const { error } = await admin.from('access_requests').update({ status: 'denied', reviewed_by: current.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', requestId).eq('org_id', current.orgId)
  if (error) throw new Error(`DATABASE: ${error.message}`); revalidatePath('/profile'); return { id: requestId }
})

export const updateManagedUser = async (userId: string, role: Role, isActive: boolean) => withActionHandler(async () => {
  const current = await requireRole(['admin']); if (userId === current.id) throw new Error('VALIDATION: You cannot disable or change your own admin access')
  const admin = await createAdminClient()
  if (isActive) {
    const { error } = await admin.from('users').update({ role, is_active: true }).eq('id', userId).eq('org_id', current.orgId)
    if (error) throw new Error(`DATABASE: ${error.message}`)
  } else {
    await deactivateUserAndAssignments(admin, userId, current.orgId)
  }
  revalidatePath('/profile'); revalidatePath('/'); revalidatePath('/companies'); revalidatePath('/pipeline'); revalidatePath('/follow-ups')
  return { id: userId }
})

async function deactivateUserAndAssignments(admin: Awaited<ReturnType<typeof createAdminClient>>, userId: string, orgId: string) {
  const now = new Date().toISOString()
  const { error: userError } = await admin.from('users').update({ is_active: false }).eq('id', userId).eq('org_id', orgId)
  if (userError) throw new Error(`DATABASE: ${userError.message}`)

  const { error: assignmentError } = await admin
    .from('relationship_assignments')
    .update({ is_active: false, end_date: now })
    .eq('user_id', userId).eq('org_id', orgId).eq('is_active', true)
  if (assignmentError) throw new Error(`DATABASE: ${assignmentError.message}`)

  // Remove the inactive user from current work queues while preserving history.
  const { error: followUpError } = await admin.from('follow_ups').update({ officer_id: null, updated_at: now }).eq('officer_id', userId).eq('org_id', orgId)
  if (followUpError) throw new Error(`DATABASE: ${followUpError.message}`)
  const { error: initiativeError } = await admin.from('initiatives').update({ owner_id: null, updated_at: now }).eq('owner_id', userId).eq('org_id', orgId)
  if (initiativeError) throw new Error(`DATABASE: ${initiativeError.message}`)
  const { error: opportunityError } = await admin.from('opportunities').update({ initiative_owner_id: null, updated_at: now }).eq('initiative_owner_id', userId).eq('org_id', orgId)
  if (opportunityError) throw new Error(`DATABASE: ${opportunityError.message}`)
}

export const seedDemoData = async () => {
  return withActionHandler(async () => {
    const supabase = await createAdminClient()

    // 1. Create a demo organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: 'Demo University Alumni Relations' })
      .select()
      .single()

    if (orgError) throw new Error(`Failed to create org: ${orgError.message}`)

    // 2. Create companies
    const companies = [
      { name: 'Acme Corp', industry: 'Technology', org_id: org.id },
      { name: 'Global Tech', industry: 'Software', org_id: org.id },
      { name: 'Future Innovators', industry: 'Consulting', org_id: org.id }
    ]
    
    const { data: insertedCompanies, error: compError } = await supabase
      .from('companies')
      .insert(companies)
      .select()

    if (compError || !insertedCompanies) throw new Error('Failed to insert companies')

    // 3. Create alumni
    const alumni = [
      { first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', graduation_year: 2018, org_id: org.id, current_company_id: insertedCompanies[0].id },
      { first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com', graduation_year: 2019, org_id: org.id, current_company_id: insertedCompanies[1].id },
      { first_name: 'Charlie', last_name: 'Brown', email: 'charlie@example.com', graduation_year: 2020, org_id: org.id, current_company_id: insertedCompanies[2].id }
    ]

    const { data: insertedAlumni, error: alumniError } = await supabase
      .from('alumni')
      .insert(alumni)
      .select()

    if (alumniError || !insertedAlumni) throw new Error('Failed to insert alumni')

    // 4. Create an admin user to author interactions (simulated via service role)
    // Actually, interactions need an author_id (uuid from auth.users). Since we can't easily 
    // mock auth.users without going through GoTrue, we might need a dummy user in public.users if RLS is bypassed. 
    // Wait, the foreign key references auth.users(id). 
    // To properly seed, we should ideally create a user via supabase.auth.admin.createUser

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo-admin@cora.app',
      password: 'password123',
      email_confirm: true
    })

    if (authError && authError.status !== 422) { // 422 if already exists
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    let userId = authUser?.user?.id

    if (!userId) {
      // Find existing user if creation failed due to already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      userId = existingUser.users.find(u => u.email === 'demo-admin@cora.app')?.id
    }

    if (!userId) throw new Error('Could not resolve user ID for seed')

    // Create public user record
    const { error: pUserError } = await supabase
      .from('users')
      .upsert({ id: userId, org_id: org.id, email: 'demo-admin@cora.app', full_name: 'Demo Admin' })

    if (pUserError) throw new Error(`Failed to upsert public user: ${pUserError.message}`)

    // 5. Create interactions
    const interactions = [
      { type: 'email', notes: 'Initial outreach about mentoring program', date: new Date().toISOString(), alumni_id: insertedAlumni[0].id, author_id: userId, org_id: org.id },
      { type: 'call', notes: 'Discussed sponsorship opportunities', date: new Date().toISOString(), company_id: insertedCompanies[1].id, author_id: userId, org_id: org.id }
    ]

    const { error: interactionError } = await supabase
      .from('interactions')
      .insert(interactions)

    if (interactionError) throw new Error(`Failed to insert interactions: ${interactionError.message}`)

    return { success: true, orgId: org.id }
  })
}

// Execute the seed script if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoData()
    .then(() => {
      console.log('Seed completed successfully')
      process.exit(0)
    })
    .catch((err) => {
      console.error('Seed failed:', err)
      process.exit(1)
    })
}
