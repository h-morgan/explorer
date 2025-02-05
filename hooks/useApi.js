import useSWR from 'swr'
import { NETWORK } from '../data/client'

export const API_BASES = {
  v1: 'https://explorer-api.helium.com/api',
  v2: 'https://explorer-api-v2.helium.com/api',
  testnet: 'https://helium-testnet-explorer-api.herokuapp.com/api',
  devnet: 'https://helium-devnet-explorer-api.herokuapp.com/api',
}

export const fetchApi =
  (version = 'v1') =>
  async (route) => {
    const base = NETWORK === 'mainnet' ? API_BASES[version] : API_BASES[NETWORK]
    const url = [base, route].join('')
    const response = await fetch(url, {
      headers: {
        'cache-control': 'max-age=60',
      },
    })
    return response.json()
  }

const useApi = (
  route,
  options = {},
  config = { localCache: true, version: 'v1' },
) => {
  let initialData

  if (typeof window !== 'undefined' && config.localCache) {
    const data = localStorage.getItem(route)
    if (data) {
      initialData = JSON.parse(data)
    }
  }

  return useSWR(route, fetchApi(config.version), {
    initialData,
    revalidateOnMount: true,
    onFailure: () => {
      if (config.localCache) {
        localStorage.removeItem(route)
      }
    },
    onSuccess: (data) => {
      if (config.localCache) {
        localStorage.setItem(route, JSON.stringify(data))
      }
    },
    ...options,
  })
}

export default useApi
