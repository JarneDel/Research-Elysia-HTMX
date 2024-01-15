import { supabase } from '@/libs'

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
    .getPublicUrl(result.data?.path)

  return { publicUrl: publicUrl.data.publicUrl }
}

export const deleteUpload = async (url: string) => {
  const parts = url.split('/media/')
  const id = parts[parts.length - 1]
  if (!id) {
    return { error: 'Invalid url' }
  }
  return supabase.storage.from('media').remove([id])
}
