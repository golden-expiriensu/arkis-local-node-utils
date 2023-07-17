import { openMarginAccount } from './open'
import { registerMarginAccount } from './register'
import strategy from './strategy.json'

async function main() {
  while (strategy.registered-- > 0) await registerMarginAccount()
  while (strategy.opened-- > 0) await openMarginAccount(await registerMarginAccount())
}

main()
