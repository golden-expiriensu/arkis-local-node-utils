import axios from 'axios'
import { hexZeroPad } from 'ethers/lib/utils'
import { getProviderUrl } from 'src/utils'
import { getEventTopic } from './getEventTopic'
import { getSynchronizationBlock } from './getSynchronizationBlock'

export async function fetchRegisteredAccount(atBlockNumber?: string, owner?: string): Promise<string> {
  const topics = [getEventTopic('AccountRegistered')]
  if (owner) topics.push(hexZeroPad(owner, 32))

  console.log(`Fetching events for topics: ${topics.join(', ')} at block number ${atBlockNumber ?? 'latest'}`)

  const body = {
    jsonrpc: '2.0',
    method: 'eth_getLogs',
    params: [
      {
        fromBlock: atBlockNumber ?? (await getSynchronizationBlock()),
        toBlock: atBlockNumber ?? 'latest',
        topics,
      },
    ],
    id: 0,
  }

  const response = await axios.post(getProviderUrl(), body)

  return response.data.result[0].address
}
