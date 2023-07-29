import { getServerUrl } from './provider'

type EndpointName = 'setStorageAt' | 'setBalance' | 'factoryAddress' | 'synchronizationBlock'

export function getEndpoint(name: EndpointName): string {
  switch (name) {
    case 'setStorageAt':
      return `${getServerUrl()}/setStorageAt`
    case 'setStorageAt':
      return `${getServerUrl()}/setStorageAt`
    case 'factoryAddress':
      return `${getServerUrl()}/address/marginAccount`
    case 'synchronizationBlock':
      return `${getServerUrl()}/synchronizationBlock`
    default:
      throw new Error(`Unknown endpoint ${name}`)
  }
}
