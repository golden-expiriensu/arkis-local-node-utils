import axios from 'axios'
import { wrapJsonRpcBody } from '../jsonRpc'
import { getFactoryAddress, getProviderUrl } from '../provider'
import { getEventTopic } from './getEventTopic'
import { getSynchronizationBlock } from './getSynchronizationBlock'
import { ContractEvent } from './types'

export async function fetchAccountBorrowed(fromBlock?: string): Promise<Array<ContractEvent>> {
  const body = wrapJsonRpcBody('eth_getLogs', {
    fromBlock: fromBlock ?? (await getSynchronizationBlock()),
    toBlock: 'latest',
    address: await getFactoryAddress(),
    topics: [getEventTopic('AccountBorrowed')],
  })
  const response = await axios.post(getProviderUrl(), body)

  return response.data.result
}
