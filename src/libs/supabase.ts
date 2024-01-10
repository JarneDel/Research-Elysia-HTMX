// src/libs/supabase.ts

import { createClient } from '@supabase/supabase-js'

const { supabase_url, supabase_service_role } = process.env

if (!supabase_url) {
  throw new Error('Missing env: supabase_url')
}
if (!supabase_service_role) {
  throw new Error('Missing env: supabase_service_role')
}

export const supabase = createClient(supabase_url!, supabase_service_role!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

/**
 * Upload media file to Supabase storage
 * @param file
 * @param filename
 * @returns storage error or public url
 */
export const uploadMediaFile = async (file: File, filename: string) => {
  const result = await supabase.storage
    .from('media')
    .upload(filename, file, { upsert: true })

  if (result.error) {
    return { error: result.error }
  }

  const publicUrl = supabase.storage
    .from('media')
    .getPublicUrl(result.data?.path!)

  return { publicUrl: publicUrl.data.publicUrl }
}
