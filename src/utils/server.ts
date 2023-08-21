import { getProviderUrl } from './provider'

export function getEndpoint(name: 'address/marginAccount' | 'synchronizationBlock'): string {
  return `${getServerUrl()}/${name}`
}

export function getServerUrl(): string {
  return process.env.SERVER_URL ?? getProviderUrl()
}
