import account from '../account.json'
import { getAddress } from '../utils'
import { getFactoryAddress } from '../provider'
import { Contract, constants } from 'ethers'

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
      content: [
        {
          sequence: [0],
          increasePositionInstructions: [],
          decreasePositionInstructions: [],
          exchangeInstructions: [
            {
              protocol: 'transfer',
              request: {
                path: `${account.leverage.token}000000000000000000000000000000000000000000000000`,
                amountIn: onlySuspend ? constants.MaxUint256 : 1,
                extraData: '0x',
                minAmountOut: 0,
                recipient: await getFactoryAddress(),
              },
            },
          ],
          exchangeAllInstructions: [],
        },
      ],
    },
    onComplete: [],
  }

  await factory.tryCloseMarginAccount(getAddress(marginAccountBytes32), liquidationPlan)

  console.log(
    `Margin account ${getAddress(marginAccountBytes32)} was ${onlySuspend ? 'suspended' : 'successfully liquidated'}`,
  )
  return marginAccountBytes32
}
