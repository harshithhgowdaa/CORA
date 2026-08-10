'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { withActionHandler } from '@/lib/actions-wrapper'
import { revalidatePath } from 'next/cache'
import { requireOrganizationMember } from '@/lib/authz'

// ============================================================
// GET DASHBOARD SUMMARY — uses separate queries to avoid recursion
// ============================================================
export const getDashboardSummary = async (filters?: { status?: string; ownerId?: string }) => {
  return withActionHandler(async () => {
    const currentUser = await requireOrganizationMember()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get user's org using admin client to bypass RLS recursion edge cases
    const adminClient = await createAdminClient()
    const { data: userData } = await adminClient
      .from('users')
      .select('org_id, full_name, role')
      .eq('id', user.id)
      .single()

    const orgId = currentUser.orgId

    // 1. Company pipeline — simple query, no deep nesting
    let companiesQuery = supabase
      .from('companies')
      .select('id, name, industry, status')
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false })
      .limit(100)
    if (filters?.status) companiesQuery = companiesQuery.eq('status', filters.status)
    const { data: companies } = await companiesQuery

    // 2. Relationship assignments for those companies
    const companyIds = (companies || []).map((c: any) => c.id)
    let assignments: any[] = []
    if (companyIds.length > 0) {
      const { data } = await supabase
        .from('relationship_assignments')
        .select('company_id, assignment_type, user_id, users(id, full_name)')
        .in('company_id', companyIds)
        .eq('is_active', true)
      assignments = data || []
    }

    // 3. Latest interaction per company
    let lastInteractions: any[] = []
    if (companyIds.length > 0) {
      const { data } = await supabase
        .from('interactions')
        .select('company_id, date, notes, type')
        .in('company_id', companyIds)
        .order('date', { ascending: false })
        .limit(50)
      lastInteractions = data || []
    }

    // Build pipeline array
    const pipeline = (companies || []).map((c: any) => {
      const companyAssignments = assignments.filter((a: any) => a.company_id === c.id)
      const primaryAssignment = companyAssignments.find((a: any) => a.assignment_type === 'PRIMARY')
      const owner = primaryAssignment?.users || null
      const lastInteraction = lastInteractions.find((i: any) => i.company_id === c.id) || null
      return {
        id: c.id,
        name: c.name,
        industry: c.industry,
        status: c.status || 'Prospect',
        owner,
        lastInteraction,
      }
    }).filter((company: any) => !filters?.ownerId || company.owner?.id === filters.ownerId)

    // 4. Follow-ups — simple flat query
    const { data: followUps } = await supabase
      .from('follow_ups')
      .select('id, title, status, due_date, priority, company_id')
      .eq('org_id', orgId)
      .in('status', ['Pending', 'In Progress', 'Overdue'])
      .order('due_date', { ascending: true })
      .limit(6)

    // Get company names for follow-ups
    const followUpCompanyIds = [...new Set((followUps || []).map((f: any) => f.company_id).filter(Boolean))]
    let followUpCompanies: any[] = []
    if (followUpCompanyIds.length > 0) {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', followUpCompanyIds)
      followUpCompanies = data || []
    }

    const now = new Date()
    let urgentFollowUp: any = null
    const regularFollowUps: any[] = []

    for (const f of (followUps || [])) {
      const dueDate = new Date(f.due_date)
      const isOverdue = dueDate < now
      const company = followUpCompanies.find((c: any) => c.id === f.company_id)
      const enriched = { ...f, isOverdue, companyName: company?.name || null }
      if (!urgentFollowUp && (isOverdue || f.priority === 'Critical' || f.priority === 'High')) {
        urgentFollowUp = enriched
      } else {
        regularFollowUps.push(enriched)
      }
    }

    // 5. Team workload — simple count approach
    let teamWorkload: any[] = []
    if (orgId) {
      const { data: teamMembers } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('org_id', orgId)
        .eq('is_active', true)

      if (teamMembers) {
        const memberIds = teamMembers.map((m: any) => m.id)
        const { data: allAssignments } = await supabase
          .from('relationship_assignments')
          .select('user_id, company_id')
          .in('user_id', memberIds)
          .eq('org_id', orgId)
          .eq('is_active', true)

        teamWorkload = teamMembers.map((m: any) => ({
          id: m.id,
          name: m.full_name,
          role: m.role,
            activeCount: new Set((allAssignments || []).filter((a: any) => a.user_id === m.id).map((a: any) => a.company_id)).size,
        }))
      }
    }

    // 6. Stats
    const [{ count: totalCompanies }, { count: totalFollowUps }, { count: totalInteractions }] = await Promise.all([
      supabase.from('companies').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
      supabase.from('follow_ups').select('id', { count: 'exact', head: true }).eq('org_id', orgId).in('status', ['Pending', 'In Progress', 'Overdue']),
      supabase.from('interactions').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    ])

    return {
      pipeline,
      urgentFollowUp,
      regularFollowUps: regularFollowUps.slice(0, 4),
      teamWorkload,
      stats: {
        totalCompanies: totalCompanies || 0,
        pendingFollowUps: totalFollowUps || 0,
        totalInteractions: totalInteractions || 0,
      }
    }
  })
}
