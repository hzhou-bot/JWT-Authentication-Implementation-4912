import { createClient } from '@supabase/supabase-js'

// Project credentials
const SUPABASE_URL = 'https://gqtbobkkrjwuonuumwqm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdGJvYmtrcmp3dW9udXVtd3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAzMzUsImV4cCI6MjA2ODY1NjMzNX0.CbnyDcKbCgMEZUXdeCNl_q1oFb_cmaUc_88pW6Yj1C0'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase