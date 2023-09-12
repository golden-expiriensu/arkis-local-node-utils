require('tsconfig-paths/register')

import { constants } from 'ethers'
import { closeMarginAccount as close } from 'src/close'
import { getFactory, getOwner } from 'src/utils'
import { createTreasure } from './createTreasure'

async function main() {
  const treasure = await createTreasure()
  const accountsToClose = [
    {
      account: '0xac903e9fbfeb49132728b0962bd2f7d1e6f59d98',
      token: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    {
      account: '0xd68ed04e1bf4199f6e0429f86e7ead56f893a100',
      token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
  ]

  const owner = await getOwner()
  const factory = (await getFactory()).connect(owner)

  await treasure.topUpEthBalance(owner.address, 0)

  for (const { account, token } of accountsToClose) {
    close(
      {
        collateral: [],
        leverage: {
          token: token,
          amount: constants.One.toHexString(),
        },
        owner: {
          name: account,
          wallet: undefined as any,
        },
      },
      factory,
      account,
    )
  }
}

main()
