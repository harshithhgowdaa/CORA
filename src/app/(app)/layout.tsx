import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { LayoutDashboard, Building2, Users, Search, LogOut, TrendingUp, Bell, CalendarClock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GlobalSearch } from '@/components/global-search'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
  const profileResult = await supabase.from('users').select('role, is_active').eq('id', user.id).maybeSingle()
  let profile = profileResult.data
  // Older deployments may not have applied the access-control migration yet.
  if (profileResult.error) {
    const legacyProfile = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
    profile = legacyProfile.data ? { ...legacyProfile.data, is_active: true } : null
  }
  if (!profile?.is_active) redirect('/login?error=Your%20CORA%20access%20is%20pending%20or%20has%20been%20disabled')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Pipeline', href: '/pipeline', icon: TrendingUp },
    { name: 'Follow-ups', href: '/follow-ups', icon: CalendarClock },
    { name: 'Search', href: '/search', icon: Search },
  ]

  return (
    <div className="flex h-screen w-full bg-app p-4 md:p-6 overflow-hidden">
      
      {/* Main App Container (Shell) */}
      <div className="flex w-full h-full bg-shell rounded-[var(--radius-shell)] shadow-sm overflow-hidden border border-border-hairline">
        
        {/* Sidebar Rail */}
        <aside className="w-[70px] bg-surface border-r border-border-hairline flex flex-col justify-between items-center py-6 flex-shrink-0 z-20">
          <div className="flex flex-col items-center gap-8 w-full">
            {/* Logo */}
            <Link href="/" className="relative w-10 h-10 overflow-hidden rounded-xl shadow-sm hover:opacity-90 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="CORA Logo" 
                fill 
                sizes="40px"
                className="object-cover" 
                priority
              />
            </Link>
            
            {/* Nav Icons */}
            <nav className="flex flex-col space-y-1 w-full items-center">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="group relative w-full flex justify-center" title={item.name}>
                  <div className="p-3 rounded-xl text-text-muted hover:text-blue-500 hover:bg-blue-100/50 transition-colors group-[.active]:text-blue-500 group-[.active]:bg-blue-100/60">
                    <item.icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Bottom: Logout */}
          <div className="flex flex-col space-y-4 w-full items-center">
            <form action="/auth/signout" method="post">
              <button className="p-3 rounded-xl text-text-muted hover:bg-subtle hover:text-text-primary transition-colors group" title="Log Out">
                <LogOut className="w-5 h-5" strokeWidth={1.8} />
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-shell relative z-10 overflow-hidden">
          
          {/* Top Bar */}
          <header className="h-[60px] flex items-center justify-between px-6 border-b border-border-hairline flex-shrink-0 bg-surface/50">
            
            {/* Nav Pills */}
            <div className="flex items-center space-x-1">
              <Link href="/" className="px-3 py-1.5 rounded-pill text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-subtle transition-colors">Dashboard</Link>
              <Link href="/companies" className="px-3 py-1.5 rounded-pill text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-subtle transition-colors">Companies</Link>
              <Link href="/pipeline" className="px-3 py-1.5 rounded-pill text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-subtle transition-colors">Pipeline</Link>
              <Link href="/follow-ups" className="px-3 py-1.5 rounded-pill text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-subtle transition-colors">Follow-ups</Link>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Global Search */}
              <GlobalSearch />

              {/* Profile */}
              <Link href="/profile" className="flex items-center gap-3 border-l border-border-hairline pl-4" title="Profile and access management">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto bg-shell">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
