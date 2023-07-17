import { getEndpoint } from '../getEndpoint'
import account from '../account.json'
import axios from 'axios'
import { getAddress } from '../addressUtils'
import { getFactoryAddress } from '../provider'
import { constants } from 'ethers'

async function generageCloseBody(marginAccountBytes32: string, fail = false): Promise<Object> {
  return {
    marginAccount: getAddress(marginAccountBytes32),
    liquidationPlan: {
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
                  path: `${account.leverage.token}00000000000000000000000000000000000000000000000F`,
                  amountIn: fail ? constants.MaxUint256 : 1,
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
    },
  }
}

export async function closeMarginAccount(marginAccountBytes32: string, onlySuspend = false): Promise<string> {
  await axios.post(getEndpoint('tryClose'), await generageCloseBody(marginAccountBytes32, onlySuspend))
  console.log(`${onlySuspend ? 'Suspended' : 'Closed'} margin account ${getAddress(marginAccountBytes32)}`)
  return marginAccountBytes32
}
