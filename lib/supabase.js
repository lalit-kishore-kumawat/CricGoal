import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vtgwwaoobkloegidxaaa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Z3d3YW9vYmtsb2VnaWR4YWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMDE0NzgsImV4cCI6MjA5OTU3NzQ3OH0.WoVQpG_mjJNQ59zNbARJjJUydGzog5D_w56MjFhMuZY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
