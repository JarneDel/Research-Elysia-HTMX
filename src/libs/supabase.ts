// src/libs/supabase.ts

import { createClient } from '@supabase/supabase-js'

const { supabase_url, supabase_service_role } = process.env

if (!supabase_url) {
  throw new Error('Missing env: supabase_url')
}
if (!supabase_service_role) {
  throw new Error('Missing env: supabase_service_role')
}

export const supabase = createClient(supabase_url!, supabase_service_role!)
