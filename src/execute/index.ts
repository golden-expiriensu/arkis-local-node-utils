import { closeMarginAccount } from 'src/close'
import { openMarginAccount } from 'src/open'
import { registerMarginAccount } from 'src/register'
import rawStrategy from 'src/strategy.json'
import { Scenario } from 'src/types'
import { getFactory, getOwner } from 'src/utils'
import { createTreasure } from './createTreasure'
import { parseStrategy } from './parseStrategy'

async function main() {
  const treasure = await createTreasure()
  const strategy = parseStrategy(rawStrategy)

  const owner = await getOwner()
  const factory = (await getFactory()).connect(owner)

  for (const register of strategy.register) {
    registerMarginAccount(treasure, register, factory)
  }

  for (const open of strategy.open) {
    registerMarginAccount(treasure, open, factory).then((registered) =>
      openMarginAccount(treasure, open, factory, registered),
    )
  }

  const promisesOfRegistration = new Array<Promise<{ scenario: Scenario; account: string }>>()
  for (const close of strategy.close) {
    const register = async () => {
      const account = await registerMarginAccount(treasure, close, factory)
      return { account, scenario: close }
    }
    promisesOfRegistration.push(register())
  }
  const registeredAccounts = await Promise.all(promisesOfRegistration)

  for (const account of registeredAccounts) {
    openMarginAccount(treasure, account.scenario, factory, account.account).then((opened) =>
      closeMarginAccount(account.scenario, factory, opened),
    )
  }
}

main()
