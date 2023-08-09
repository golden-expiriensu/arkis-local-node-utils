import { Contract } from 'ethers'
import account from '../account.json'
import { getAddress, setBalance, setTokenBalance } from '../utils'
import ERC20 from '../artifacts/IERC20.json'

export async function openMarginAccount(factory: Contract, marginAccountBytes32: string): Promise<string> {
  if (getAddress(account.leverage.token) === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    await setBalance(factory.address, account.leverage.amount)
  } else {
    await setTokenBalance(
      new Contract(account.leverage.token, ERC20, factory.provider),
      factory.address,
      account.leverage.amount,
    )
  }

  await factory.submitPlan([
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
                    extraData: marginAccountBytes32,
                  },
                  input: [account.leverage],
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
  ])

  console.log(`Margin account ${getAddress(marginAccountBytes32)} was supplied with leverage and is now open`)
  return marginAccountBytes32
}
