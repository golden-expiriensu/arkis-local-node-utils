import axios from 'axios'
import { wrapJsonRpcBody } from '../jsonRpc'
import { getFactoryAddress, getProviderUrl } from '../provider'
import { getEventTopic } from './getEventTopic'
import { getSynchronizationBlock } from './getSynchronizationBlock'

async function main() {
  const body = wrapJsonRpcBody('eth_getLogs', {
    fromBlock: await getSynchronizationBlock(),
    toBlock: 'latest',
    address: await getFactoryAddress(),
    topics: [getEventTopic('AccountBorrowed')],
  })
  const response = await axios.post(getProviderUrl(), body)

  console.log(response.data.result)
}

main()
