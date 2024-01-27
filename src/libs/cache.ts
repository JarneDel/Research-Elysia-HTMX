import NodeCache from 'node-cache'

export const cache = new NodeCache({
  maxKeys: 1000,
  deleteOnExpire: true,
})
