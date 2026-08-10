import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fix() {
  console.log('Fetching auth users...')
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('Error fetching auth users:', authError)
    return
  }
  
  console.log(`Found ${authData.users.length} auth users.`)
  
  // Get or create default org
  let { data: org } = await supabase.from('organizations').select('id').limit(1).maybeSingle()
  
  if (!org) {
    console.log('No org found, creating default org...')
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: 'CORA Organization' })
      .select('id')
      .single()
      
    if (orgError) {
      console.error('Error creating org:', orgError)
      return
    }
    org = newOrg
  }
  
  console.log(`Using Org ID: ${org?.id}`)
  
  for (const user of authData.users) {
    console.log(`Upserting public.user for ${user.email}...`)
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      org_id: org?.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: 'officer'
    }, { onConflict: 'id' })
    
    if (error) {
      console.error(`Failed for ${user.email}:`, error)
    } else {
      console.log(`Success for ${user.email}`)
    }
  }
  
  console.log('Done!')
}

fix()
