import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Contract } from 'ethers'
import ERC20 from '../artifacts/IERC20.json'
import { AccountConfig } from '../types'
import { getAddress, topUpBalance, topUpTokenBalance } from '../utils'

export async function openMarginAccount(
  config: AccountConfig,
  nonce: number,
  factory: Contract,
  marginAccountBytes32: string,
): Promise<string> {
  let res: TransactionResponse | null
  if (getAddress(config.leverage.token) === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    res = await topUpBalance(factory.address, config.leverage.amount)
  } else {
    res = await topUpTokenBalance(
      new Contract(config.leverage.token, ERC20, factory.provider),
      factory.address,
      config.leverage.amount,
    )
  }
  if (res) await res.wait()

  const tx = await factory.submitPlan(
    [
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
                    input: [config.leverage],
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
    ],
    { nonce },
  )

  const receipt = await tx.wait()

  console.log(
    `Margin account ${getAddress(marginAccountBytes32)} was supplied with leverage in block ${
      receipt.blockNumber
    } and is now open`,
  )
  return marginAccountBytes32
}
