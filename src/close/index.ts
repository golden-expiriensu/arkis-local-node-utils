import account from '../account.json'
import { getAddress } from '../utils'
import { getFactoryAddress } from '../provider'
import { Contract, constants } from 'ethers'
import { parseEther } from 'ethers/lib/utils'

export async function closeMarginAccount(
  factory: Contract,
  marginAccountBytes32: string,
  onlySuspend = false,
): Promise<string> {
  const liquidationPlan = {
    action: {
      route: {
        protocol: '',
        destination: 'localhost',
      },
      content: await createContent(onlySuspend),
    },
    onComplete: [],
  }

  await factory.tryCloseMarginAccount(getAddress(marginAccountBytes32), liquidationPlan)

  console.log(
    `Margin account ${getAddress(marginAccountBytes32)} was ${onlySuspend ? 'suspended' : 'successfully liquidated'}`,
  )
  return marginAccountBytes32
}

async function createContent(onlySuspend: boolean): Promise<Object> {
  const envelope: any = {
    sequence: [0],
    increasePositionInstructions: [],
    decreasePositionInstructions: [],
    exchangeInstructions: [],
    exchangeAllInstructions: [],
  }

  envelope.exchangeInstructions.push({
    protocol: 'transfer',
    request: {
      path: `${account.leverage.token}000000000000000000000000000000000000000000000000`,
      amountIn: onlySuspend ? constants.MaxUint256 : 1,
      extraData: '0x',
      minAmountOut: 0,
      recipient: await getFactoryAddress(),
    },
  })

  return [envelope]
}
