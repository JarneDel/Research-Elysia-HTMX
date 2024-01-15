import * as process from 'process'
import { createClient, RedisClientOptions } from 'redis'

let options: RedisClientOptions = {
  url: process.env.REDIS_URL,
}
if (process.env.REDIS_PASS) {
  options.password = process.env.REDIS_PASS
}

if (process.env.NODE_ENV === 'development') {
  options = {
    url: 'redis://localhost:6379',
  }
}

export const redisClient = await createClient(options)
  .on('error', error => {
    console.log({ error })
  })
  .connect()
