import * as process from 'process'

export const checkEnv = () => {
  const envs = ['PORT', 'supabase_url', 'supabase_service_role']
  const missing = envs.filter(env => !process.env[env])
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}
