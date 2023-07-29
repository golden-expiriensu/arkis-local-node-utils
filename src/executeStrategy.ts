import { closeMarginAccount } from './close'
import { openMarginAccount } from './open'
import { registerMarginAccount } from './register'
import strategy from './strategy.json'
import { getFactoryAsOwner } from './provider'

async function main() {
  const factory = await getFactoryAsOwner()

  while (strategy.registered-- > 0) {
    await registerMarginAccount(factory)
    console.log('Register strategy done')
  }

  while (strategy.opened-- > 0) {
    const registered = await registerMarginAccount(factory)
    await openMarginAccount(factory, registered)
    console.log('Open strategy done')
  }

  while (strategy.suspended-- > 0) {
    const registered = await registerMarginAccount(factory)
    const opened = await openMarginAccount(factory, registered)
    await closeMarginAccount(factory, opened, true)
    console.log('Suspend strategy done')
  }

  const toClose = new Array<string>()
  while (strategy.closed-- > 0) {
    const registered = await registerMarginAccount(factory)
    toClose.push(await openMarginAccount(factory, registered))
  }
  for (const opened of toClose) {
    await closeMarginAccount(factory, opened)
    console.log('Close strategy done')
  }
}

main()
