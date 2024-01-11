import { createClient } from 'redis'

console.log({ REDIS_URL: process.env.REDIS_URL })

export const redisClient = await createClient({
  url: process.env.REDIS_URL,
})
  .on('error', error => {
    console.log({ error })
  })
  .connect()
