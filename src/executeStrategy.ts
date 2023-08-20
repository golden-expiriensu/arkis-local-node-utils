import { BigNumber } from 'ethers'
import { closeMarginAccount } from './close'
import { openMarginAccount } from './open'
import { getFactoryAsOwner, getOwner } from './provider'
import { registerMarginAccount } from './register'
import strategy from './strategy.json'
import { Treasure } from './treasure'
import { AccountConfig } from './types'

async function main() {
  const treasure = new Treasure()
  await treasure.init()

  const usedPrivateKeys = new Set<string>()
  for (const elem of [...strategy.register, ...strategy.open, ...strategy.close]) {
    if (usedPrivateKeys.has(elem.ownerPrivateKey)) throw new Error(`Duplicated private key: ${elem.ownerPrivateKey}`)
    for (const asset of [...elem.collateral, elem.leverage]) {
      asset.amount = BigNumber.from(asset.amount).toHexString()
    }
  }

  const factory = await getFactoryAsOwner()

  for (const register of strategy.register) {
    registerMarginAccount(treasure, register, factory)
  }

  const md = {
    nonce: await getOwner().getTransactionCount(),
  }

  for (const open of strategy.open) {
    registerMarginAccount(treasure, open, factory).then((registered) =>
      openMarginAccount(treasure, open, md.nonce++, factory, registered),
    )
  }

  const promisesOfRegistration = new Array<Promise<{ config: AccountConfig; account: string }>>()
  for (const close of strategy.close) {
    promisesOfRegistration.push(
      (async () => {
        const account = await registerMarginAccount(treasure, close, factory)
        return {
          config: close,
          account,
        }
      })(),
    )
  }
  const registeredAccs = await Promise.all(promisesOfRegistration)

  for (const registered of registeredAccs) {
    openMarginAccount(treasure, registered.config, md.nonce++, factory, registered.account).then((opened) =>
      closeMarginAccount(registered.config, md.nonce++, factory, opened),
    )
    console.log('Close strategy done')
  }
}

main()
