import { closeMarginAccount } from './close'
import { openMarginAccount } from './open'
import { registerMarginAccount } from './register'
import strategy from './strategy.json'
import { getFactoryAsOwner, getOwner } from './provider'
import { AccountConfig } from './types'
import { BigNumber } from 'ethers'

async function main() {
  const usedPrivateKeys = new Set<string>()
  for (const elem of [...strategy.register, ...strategy.open, ...strategy.close]) {
    if (usedPrivateKeys.has(elem.ownerPrivateKey)) throw new Error(`Duplicated private key: ${elem.ownerPrivateKey}`)
    for (const asset of [...elem.collateral, elem.leverage]) {
      asset.amount = BigNumber.from(asset.amount).toHexString()
    }
  }

  const factory = await getFactoryAsOwner()

  for (const register of strategy.register) {
    registerMarginAccount(register, factory)
  }

  const md = {
    nonce: await getOwner().getTransactionCount(),
  }

  for (const open of strategy.open) {
    registerMarginAccount(open, factory).then((registered) => openMarginAccount(open, md.nonce++, factory, registered))
  }

  const promisesOfRegistration = new Array<Promise<{ config: AccountConfig; account: string }>>()
  for (const close of strategy.close) {
    promisesOfRegistration.push(
      (async () => {
        const account = await registerMarginAccount(close, factory)
        return {
          config: close,
          account,
        }
      })(),
    )
  }
  const registeredAccs = await Promise.all(promisesOfRegistration)

  for (const registered of registeredAccs) {
    openMarginAccount(registered.config, md.nonce++, factory, registered.account).then((opened) =>
      closeMarginAccount(registered.config, md.nonce++, factory, opened),
    )
    console.log('Close strategy done')
  }
}

main()
