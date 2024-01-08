import { createClient } from 'redis'

export const redisClient = await createClient()
  .on('error', error => {
    console.log({ error })
  })
  .connect()
