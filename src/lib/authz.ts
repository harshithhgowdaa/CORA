import { createClient } from './supabase/server'
import { CORA_ADMIN_EMAIL, hasPermission, type CurrentUser, type Permission, type Role } from './domain'

function normalizeRole(role: string): Role {
  if (role === 'admin' || role === 'manager' || role === 'officer' || role === 'student_assistant' || role === 'read_only') return role
  return 'officer'
}

export async function requireUser(): Promise<CurrentUser> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('UNAUTHENTICATED: Sign in is required')
  const { data: profile, error: profileError } = await supabase.from('users').select('id, org_id, email, full_name, role').eq('id', user.id).single()
  if (profileError || !profile) throw new Error('UNAUTHENTICATED: Your account is not provisioned')
  const email = (user.email ?? profile.email).toLowerCase()
  const role = email === CORA_ADMIN_EMAIL ? 'admin' : normalizeRole(profile.role)
  return { id: profile.id, orgId: profile.org_id, email, fullName: profile.full_name, role }
}

export async function requireOrganizationMember(): Promise<CurrentUser> { return requireUser() }
export async function requireRole(roles: readonly Role[]): Promise<CurrentUser> { const current = await requireUser(); if (!roles.includes(current.role)) throw new Error('FORBIDDEN: Insufficient permissions'); return current }
export async function requirePermission(permission: Permission): Promise<CurrentUser> { const current = await requireUser(); if (!hasPermission(current.role, permission)) throw new Error('FORBIDDEN: Insufficient permissions'); return current }
