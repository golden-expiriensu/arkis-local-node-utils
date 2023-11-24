import { Contract, zeroPadValue } from 'ethers'
import { getAbi, getProvider } from '../../config'

export async function createAllocationPlan(account: string): Promise<Object> {
  const acc = new Contract(account, getAbi('account'), getProvider())
  const leverage = await acc.leverage()

  return [
    {
      action: {
        route: {
          protocol: '',
          destination: 'localhost',
        },
        content: [
          {
            sequence: [1, 0],
            increasePositionInstructions: [
              {
                protocol: 'arkis.marginaccount',
                request: {
                  descriptor: {
                    poolId: 0,
                    extraData: zeroPadValue(account, 32),
                  },
                  input: [
                    {
                      // NOTE: please don't touch this if you don't want to traumatize ethers@6
                      token: leverage.token,
                      // NOTE: please don't touch this if you don't want to traumatize ethers@6
                      amount: leverage.amount,
                    },
                  ],
                  minLiquidityOut: 0,
                },
              },
            ],
            decreasePositionInstructions: [
              {
                protocol: 'arkis.liquiditypool',
                request: {
                  descriptor: {
                    poolId: 0,
                    extraData: '0x',
                  },
                  liquidity: leverage.amount,
                  minOutput: [
                    {
                      // NOTE: please don't touch this if you don't want to traumatize ethers@6
                      token: leverage.token,
                      // NOTE: please don't touch this if you don't want to traumatize ethers@6
                      amount: leverage.amount,
                    },
                  ],
                },
              },
            ],
            exchangeInstructions: [],
            exchangeAllInstructions: [],
          },
        ],
      },
      onComplete: [],
    },
  ]
}
