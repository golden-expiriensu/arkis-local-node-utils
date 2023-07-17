import { getEndpoint } from '../getEndpoint'
import account from '../account.json'
import axios from 'axios'
import { getAddress } from '../getAddress'

async function generateSumbitPlanBody(marginAccountBytes32: string): Promise<Object> {
  return {
    sequence: [0],
    increasePositionInstructions: [
      {
        protocol: 'arkis.marginaccount',
        request: {
          descriptor: {
            poolId: 0,
            extraData: marginAccountBytes32,
          },
          input: [account.leverage],
          minLiquidityOut: 0,
        },
      },
    ],
    decreasePositionInstructions: [
      {
        protocol: 'arkis-liquiditypool',
        request: {
          descriptor: {
            poolId: 0,
            extraData: '0x',
          },
          liquidity: account.leverage.amount,
          minOutput: [account.leverage],
        },
      },
    ],
  }
}

export async function openMarginAccount(marginAccountBytes32: string): Promise<string> {
  await axios.post(getEndpoint('submitPlan'), await generateSumbitPlanBody(marginAccountBytes32))
  console.log(`Opened margin account ${getAddress(marginAccountBytes32)}`)
  return marginAccountBytes32
}
