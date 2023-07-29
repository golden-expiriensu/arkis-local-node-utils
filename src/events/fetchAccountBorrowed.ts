import axios from 'axios'
import { getFactoryAddress, getProviderUrl } from '../provider'
import { getEventTopic } from './getEventTopic'
import { getSynchronizationBlock } from './getSynchronizationBlock'

export async function fetchAccountBorrowed(fromBlock?: string): Promise<
  Array<{
    data: string
    topics: Array<string>
  }>
> {
  const body = {
    jsonrpc: '2.0',
    method: 'eth_getLogs',
    params: [
      {
        fromBlock: fromBlock ?? (await getSynchronizationBlock()),
        toBlock: 'latest',
        address: await getFactoryAddress(),
        topics: [getEventTopic('AccountBorrowed')],
      },
    ],
    id: 0,
  }

  const response = await axios.post(getProviderUrl(), body)

  return response.data.result
}
