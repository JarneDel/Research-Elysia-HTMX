import {
  ListOutputResponse,
  LiveInputResponse,
} from '@/types/streaming.interface.ts'

const account_identifier = process.env.account_identifier
const cloudflare_api_key = process.env.cloudflare_api_key

if (!account_identifier || !cloudflare_api_key) {
  throw new Error('Missing cloudflare credentials')
}

export const createStreamCredentials = async (): Promise<LiveInputResponse> => {
  const result = await fetchWithCredentials(
    `https://api.cloudflare.com/client/v4/accounts/${account_identifier}/stream/live_inputs`,
    {
      method: 'POST',
    },
  )
  return (await result.json()) as LiveInputResponse
}

export const listLiveInputs = async (): Promise<LiveInputResponse> => {
  const result = await fetchWithCredentials(
    `https://api.cloudflare.com/client/v4/accounts/${account_identifier}/stream/live_inputs`,
    {
      method: 'GET',
    },
  )
  return (await result.json()) as LiveInputResponse
}

export const deleteLiveInput = async (liveInputIdentifier: string) => {
  const result = await fetchWithCredentials(
    `https://api.cloudflare.com/client/v4/accounts/${account_identifier}/stream/live_inputs/${liveInputIdentifier}`,
    {
      method: 'DELETE',
    },
  )
  return result.status === 200
}

const fetchWithCredentials = async (url: string, options: RequestInit) => {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + cloudflare_api_key,
    },
  })
}

const retrieveLiveInput = async (liveInputIdentifier: string) => {
  const result = await fetchWithCredentials(
    `https://api.cloudflare.com/client/v4/accounts/${account_identifier}/stream/live_inputs/${liveInputIdentifier}`,
    {
      method: 'GET',
    },
  )
  return (await result.json()) as LiveInputResponse
}

/**
 * List all outputs associated with a specified live input
 */
const listOutputs = async (liveInputIdentifier: string) => {
  const result = await fetchWithCredentials(
    `https://api.cloudflare.com/client/v4/accounts/${account_identifier}/stream/live_inputs/${liveInputIdentifier}/outputs`,
    {
      method: 'GET',
    },
  )
  return (await result.json()) as ListOutputResponse
}
