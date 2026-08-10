import { requireUser } from '@/lib/authz'
import { getAdminOverview } from '@/app/actions/admin'
import { AdminConsole } from '@/components/admin/admin-console'

export default async function ProfilePage() {
  const user = await requireUser(); const overview = user.role === 'admin' ? await getAdminOverview() : null
  return <div className="w-full max-w-5xl mx-auto p-6 space-y-6"><div><h1 className="text-[24px] font-semibold text-text-primary">Profile</h1><p className="text-sm text-text-secondary mt-1">{user.fullName} · {user.email} · {user.role}</p></div>{user.role === 'admin' ? (overview?.success ? <AdminConsole requests={overview.data.requests} users={overview.data.users} /> : <div className="bg-amber-50 border border-amber-200 rounded-card p-5 text-sm text-amber-800"><p className="font-semibold">Admin access is active.</p><p className="mt-1">The access-management tables are not available yet. Apply the latest Supabase migration, then refresh this page.</p><p className="mt-2 text-xs">{overview?.error}</p></div>) : <div className="bg-shell rounded-card border border-border-hairline p-5 text-sm text-text-secondary">Your account is managed by a CORA administrator.</div>}</div>
}
