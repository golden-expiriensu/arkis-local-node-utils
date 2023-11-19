import { Contract } from 'ethers'
import { getProvider, getServerUrl } from './env'
import { getAbi } from './abi'

export async function getDispatcher(): Promise<Contract> {
  const response = await fetch(`${getServerUrl()}/address/marginAccount`)
  return new Contract(await response.text(), getAbi('dispatcher'), getProvider())
}
