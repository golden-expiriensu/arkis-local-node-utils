require('tsconfig-paths').register()
import { BigNumber } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import strategy from '../new_strategy.json'
import { createTreasure } from './createTreasure'
import { openMarginAccount as open } from './open'
import { registerMarginAccount as register } from './register'
import { Asset, Scenario } from './types'
import { getFactory, getJsonProvider, getOwner } from './utils'
import { ImpersonatedSigner } from './utils/impersonatedSigner'

async function main(trader: string) {
  if (!isAddress(trader)) throw new Error('Invalid trader address: ' + trader)

  const owner = await getOwner()
  const factory = (await getFactory()).connect(owner)
  const treasure = await createTreasure()
  await treasure.topUpEthBalance(owner.address, 0)

  const impersonatedTrader = new ImpersonatedSigner(trader, getJsonProvider())
  const collateral = getAndValidateCollateral(strategy)
  const leverage = getAndValidateLeverage(strategy)

  const scenario: Scenario = {
    owner: {
      name: trader,
      wallet: impersonatedTrader,
    },
    collateral,
    leverage,
  }

  try {
    const registered = await register(treasure, scenario, factory)
    await open(treasure, scenario, factory, registered)
    console.log('Successfully registered and opened margin account: ' + registered)
  } catch (err) {
    if (!(err instanceof Error)) {
      throw err
    }
    console.log(`an error received: ${(err as any).message}`)
  }
}

main(process.argv[2])

function getAndValidateCollateral(body: any): Array<Asset> {
  if (!Array.isArray(body.collateral)) throw new Error('Collateral must be an array')

  const collateral = new Array<Asset>()
  for (const asset of body.collateral) {
    collateral.push(parseAsset(asset))
  }

  return collateral
}

function getAndValidateLeverage(body: any): Asset {
  return parseAsset(body.leverage)
}

function parseAsset(asset: any): Asset {
  if (!isAddress(asset.token)) throw new Error('Invalid token address:', asset.token)
  return {
    token: asset.token,
    amount: BigNumber.from(asset.amount).toHexString(),
  }
}
