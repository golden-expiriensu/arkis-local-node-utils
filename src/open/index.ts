import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Contract } from 'ethers'
import ERC20 from '../artifacts/IERC20.json'
import { Treasure } from '../treasure'
import { AccountConfig } from '../types'
import { getAddress } from '../utils'

export async function openMarginAccount(
  treasure: Treasure,
  config: AccountConfig,
  nonce: number,
  factory: Contract,
  marginAccountBytes32: string,
): Promise<string> {
  console.log(`${getAddress(marginAccountBytes32)}---> Submitting allocation plan...`)
  console.log(`${getAddress(marginAccountBytes32)}---> Owner (${await factory.signer.getAddress()}) nonce is ${nonce}`)

  let res: TransactionResponse | null
  if (getAddress(config.leverage.token) === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    res = await treasure.topUpBalance(factory.address, config.leverage.amount)
  } else {
    res = await treasure.topUpTokenBalance(
      new Contract(config.leverage.token, ERC20, factory.provider),
      factory.address,
      config.leverage.amount,
    )
  }
  if (res) await res.wait()

  console.log(`${getAddress(marginAccountBytes32)}---> Added leverage to factory to supply margin account`)

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
    `${getAddress(marginAccountBytes32)}---> Margin account was supplied with leverage in block ${
      receipt.blockNumber
    } and is now open`,
  )
  return marginAccountBytes32
}
