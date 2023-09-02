import { getProviderUrl } from './provider'

export function getEndpoint(name: 'address/marginAccount' | 'address/liquidityPool' | 'synchronizationBlock'): string {
  return `${getServerUrl()}/${name}`
}

export function getServerUrl(): string {
  return process.env.SERVER_URL ?? getProviderUrl()
}
