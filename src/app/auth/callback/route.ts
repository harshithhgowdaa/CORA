import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { CORA_ADMIN_EMAIL, RVU_DOMAIN } from '@/lib/domain'

const displayName = (user: { email?: string; user_metadata?: Record<string, unknown> }) => typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : user.email?.split('@')[0] || 'RVU User'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url); const code = searchParams.get('code'); const next = searchParams.get('next') ?? '/'
  if (!code) return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate`)
  const supabase = await createClient(); const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user || !data.user.email) return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate`)
  const email = data.user.email.toLowerCase(); const admin = await createAdminClient()
  let { data: org } = await admin.from('organizations').select('id').order('created_at').limit(1).maybeSingle()
  if (!org) { const created = await admin.from('organizations').insert({ name: 'RVU Corporate Relations' }).select('id').single(); if (created.error) return NextResponse.redirect(`${origin}/login?error=Organization%20setup%20failed`); org = created.data }
  const name = displayName(data.user)
  if (!email.endsWith(RVU_DOMAIN)) { await supabase.auth.signOut(); return NextResponse.redirect(`${origin}/login?error=Only%20RVU%20email%20addresses%20can%20request%20access`) }
  if (email === CORA_ADMIN_EMAIL) {
    const adminUpsert = await admin.from('users').upsert({ id: data.user.id, org_id: org.id, email, full_name: name, role: 'admin', is_active: true }, { onConflict: 'id' })
    // Keep the bootstrap usable while an older deployment is applying the access migration.
    if (adminUpsert.error) {
      const legacyUpsert = await admin.from('users').upsert({ id: data.user.id, org_id: org.id, email, full_name: name, role: 'admin' }, { onConflict: 'id' })
      if (legacyUpsert.error) return NextResponse.redirect(`${origin}/login?error=Admin%20profile%20could%20not%20be%20created`)
    }
    await admin.from('access_requests').upsert({ auth_user_id: data.user.id, org_id: org.id, email, full_name: name, status: 'approved', requested_role: 'admin', reviewed_at: new Date().toISOString() }, { onConflict: 'auth_user_id,org_id' })
    return NextResponse.redirect(`${origin}${next}`)
  }
  const { data: member } = await admin.from('users').select('id, is_active').eq('id', data.user.id).maybeSingle()
  if (member && !member.is_active) { await supabase.auth.signOut(); return NextResponse.redirect(`${origin}/login?error=Access%20denied%20by%20a%20CORA%20administrator`) }
  if (member?.is_active) return NextResponse.redirect(`${origin}${next}`)
  const { data: accessRequest } = await admin.from('access_requests').select('status').eq('auth_user_id', data.user.id).eq('org_id', org.id).maybeSingle()
  if (accessRequest?.status === 'denied') { await supabase.auth.signOut(); return NextResponse.redirect(`${origin}/login?error=Access%20denied%20by%20a%20CORA%20administrator`) }
  if (accessRequest?.status === 'approved') {
    await admin.from('users').upsert({ id: data.user.id, org_id: org.id, email, full_name: name, role: 'officer', is_active: true }, { onConflict: 'id' })
    return NextResponse.redirect(`${origin}${next}`)
  }
  await admin.from('access_requests').upsert({ auth_user_id: data.user.id, org_id: org.id, email, full_name: name, status: 'pending', requested_role: 'officer' }, { onConflict: 'auth_user_id,org_id' })
  await supabase.auth.signOut()
  return NextResponse.redirect(`${origin}/login?status=pending`)
}
