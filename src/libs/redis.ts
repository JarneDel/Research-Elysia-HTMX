import { createClient } from 'redis'

console.log({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASS,
})

export const redisClient = await createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASS,
})
  .on('error', error => {
    console.log({ error })
  })
  .connect()
