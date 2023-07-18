import { getServerUrl } from './provider'

type EndpointName = 'register' | 'submitPlan' | 'tryClose' | 'factoryAddress' | 'synchronizationBlock'

export function getEndpoint(name: EndpointName): string {
  switch (name) {
    case 'register':
      return `${getServerUrl()}/register`
    case 'submitPlan':
      return `${getServerUrl()}/submitPlan`
    case 'tryClose':
      return `${getServerUrl()}/tryCloseMarginAccount`
    case 'factoryAddress':
      return `${getServerUrl()}/address/marginAccount`
    case 'synchronizationBlock':
      return `${getServerUrl()}/synchronizationBlock`
    default:
      throw new Error(`Unknown endpoint ${name}`)
  }
}
