import { Scenario } from 'api/types'
import { hexZeroPad } from 'ethers/lib/utils'

export function createAllocationPlan(account: string, scenario: Scenario): Object {
  return [
    {
      action: {
        route: {
          protocol: '',
          destination: 'localhost',
        },
        content: [
          {
            sequence: [0],
            increasePositionInstructions: [
              {
                protocol: 'arkis.marginaccount',
                request: {
                  descriptor: {
                    poolId: 0,
                    extraData: hexZeroPad(account, 32),
                  },
                  input: [scenario.leverage],
                  minLiquidityOut: 0,
                },
              },
            ],
            decreasePositionInstructions: [],
            exchangeInstructions: [],
            exchangeAllInstructions: [],
          },
        ],
      },
      onComplete: [],
    },
  ]
}
