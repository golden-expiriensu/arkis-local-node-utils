import { getEndpoint } from '../getEndpoint'
import axios from 'axios'

export async function getSynchronizationBlock(): Promise<string> {
  const response = await axios.get(getEndpoint('synchronizationBlock'))
  return response.data.blockNumber.replace('0x0', '0x')
}
