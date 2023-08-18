import { Contract, constants } from 'ethers'
import { getFactoryAddress } from '../provider'
import { AccountConfig } from '../types'
import { getAddress } from '../utils'

export async function closeMarginAccount(
  config: AccountConfig,
  nonce: number,
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
      content: await createContent(config, onlySuspend),
    },
    onComplete: [],
  }

  const tx = await factory.tryCloseMarginAccount(getAddress(marginAccountBytes32), liquidationPlan, { nonce })
  const receipt = await tx.wait()

  console.log(
    `Margin account ${getAddress(marginAccountBytes32)} was ${
      onlySuspend ? 'suspended' : 'successfully liquidated'
    } in block ${receipt.blockNumber}`,
  )

  return marginAccountBytes32
}

async function createContent(config: AccountConfig, onlySuspend: boolean): Promise<Object> {
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
      path: `${config.leverage.token}000000000000000000000000000000000000000000000000`,
      amountIn: onlySuspend ? constants.MaxUint256 : 1,
      extraData: '0x',
      minAmountOut: 0,
      recipient: await getFactoryAddress(),
    },
  })

  return [envelope]
}
