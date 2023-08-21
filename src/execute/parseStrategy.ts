import { Wallet } from 'ethers'
import { keccak256 } from 'ethers/lib/utils'
import { RawScenario, Scenario, Strategy } from 'src/types'
import { getProvider } from 'src/utils'

export function parseStrategy(strategy: Strategy<RawScenario>): Strategy<Scenario> {
  const usedNames = new Set<string>()
  const parsedStrategy: Strategy<Scenario> = { register: [], open: [], suspend: [], close: [] }

  for (const strKey in strategy) {
    const key = strKey as keyof Strategy<RawScenario>

    for (const scenario of strategy[key]) {
      const name = scenario.owner

      if (usedNames.has(name)) throw new Error(`Duplicated owner name: ${name}`)
      usedNames.add(name)

      const wallet = new Wallet(keccak256(name), getProvider())

      parsedStrategy[key].push({
        ...scenario,
        owner: { name, wallet },
      })
    }
  }

  return parsedStrategy
}
