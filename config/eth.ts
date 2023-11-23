import { Contract } from 'ethers'
import { getProvider, getServerUrl } from './env'
import { getAbi } from './abi'

export async function getDispatcher(): Promise<Contract> {
  const response = await fetch(`${getServerUrl()}/address/marginEngine`)
  return new Contract(await response.text(), getAbi('dispatcher'), getProvider())
}

export async function getPoolRegistry(): Promise<Contract> {
  const response = await fetch(`${getServerUrl()}/address/liquidityPool`)
  return new Contract(await response.text(), getAbi('pool_registry'), getProvider())
}
