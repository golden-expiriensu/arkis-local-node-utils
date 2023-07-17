import { getProviderUrl } from './provider'

type EndpointName = 'register' | 'submitPlan' | 'tryClose' | 'factoryAddress' | 'synchronizationBlock'

export function getEndpoint(name: EndpointName): string {
  switch (name) {
    case 'register':
      return `${getProviderUrl()}/register`
    case 'submitPlan':
      return `${getProviderUrl()}/submitPlan`
    case 'tryClose':
      return `${getProviderUrl()}/tryCloseMarginAccount`
    case 'factoryAddress':
      return `${getProviderUrl()}/address/marginAccount`
    case 'synchronizationBlock':
      return `${getProviderUrl()}/synchronizationBlock`
    default:
      throw new Error(`Unknown endpoint ${name}`)
  }
}
