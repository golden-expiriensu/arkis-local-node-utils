import { closeMarginAccount } from './close'
import { openMarginAccount } from './open'
import { registerMarginAccount } from './register'
import strategy from './strategy.json'

async function main() {
  while (strategy.registered-- > 0) {
    await registerMarginAccount()
    console.log('Register strategy done')
  }

  while (strategy.opened-- > 0) {
    const registered = await registerMarginAccount()
    await openMarginAccount(registered)
    console.log('Open strategy done')
  }

  while (strategy.suspended-- > 0) {
    const registered = await registerMarginAccount()
    const opened = await openMarginAccount(registered)
    await closeMarginAccount(opened, true)
    console.log('Suspend strategy done')
  }

  const toClose = new Array<string>()
  while (strategy.closed-- > 0) {
    const registered = await registerMarginAccount()
    toClose.push(await openMarginAccount(registered))
  }
  for (const opened of toClose) {
    await closeMarginAccount(opened)
    console.log('Close strategy done')
  }
}

main()
