import axios from 'axios'
import { BigNumber } from 'ethers'
import { getEndpoint } from '../server'

export async function getSynchronizationBlock(): Promise<string> {
  const response = await axios.get(getEndpoint('synchronizationBlock'))
  return BigNumber.from(response.data.blockNumber).toHexString()
}
