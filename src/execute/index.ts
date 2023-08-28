require('tsconfig-paths/register')

import { closeMarginAccount as close } from 'src/close'
import { openMarginAccount as open } from 'src/open'
import { registerMarginAccount as register } from 'src/register'
import rawStrategy from 'src/strategy.json'
import { Scenario } from 'src/types'
import { getFactory, getOwner } from 'src/utils'
import { createTreasure } from './createTreasure'
import { handleFailedScenario as handleFail } from './handleFailedScenario'
import { parseStrategy } from './parseStrategy'

async function main() {
  const treasure = await createTreasure()
  const strategy = await parseStrategy(rawStrategy)

  const owner = await getOwner()
  const factory = (await getFactory()).connect(owner)

  await treasure.topUpEthBalance(owner.address, 0)

  for (const scenario of strategy.register) {
    console.log('Starting register strategies...\n')

    register(treasure, scenario, factory).catch((err) => handleFail(scenario, err))
  }

  for (const scenario of strategy.open) {
    console.log('Starting open strategies...\n')

    register(treasure, scenario, factory)
      .then((registered) => open(treasure, scenario, factory, registered).catch((err) => handleFail(scenario, err)))
      .catch((err) => handleFail(scenario, err))
  }

  type Registered = { scenario: Scenario; account: string }
  type MaybeRegistered = Registered | undefined
  const promisesOfRegistration = new Array<Promise<MaybeRegistered>>()
  for (const scenario of strategy.close) {
    const execRegister = async () => {
      try {
        const account = await register(treasure, scenario, factory)
        return { account, scenario }
      } catch (err: any) {
        handleFail(scenario, err as Error)
        return undefined
      }
    }
    promisesOfRegistration.push(execRegister())
  }
  const registeredAccounts = (await Promise.all(promisesOfRegistration)).filter(
    (res) => typeof res !== 'undefined',
  ) as Array<Registered>

  for (const account of registeredAccounts) {
    console.log('Starting close strategies...\n')

    open(treasure, account.scenario, factory, account.account).then((opened) =>
      close(account.scenario, factory, opened),
    )
  }
}

main()
