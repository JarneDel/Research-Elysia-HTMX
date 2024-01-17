import * as process from 'process'

export const checkEnv = () => {
  console.log(process.env.NODE_ENV)
  const envs = [
    'PORT',
    'REDIS_URL',
    'REDIS_PASS',
    'supabase_url',
    'supabase_service_role',
  ]
  const missing = envs.filter(env => !process.env[env])
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

checkEnv()