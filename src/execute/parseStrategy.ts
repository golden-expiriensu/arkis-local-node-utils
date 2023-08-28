import { solidityKeccak256 } from 'ethers/lib/utils'
import { RawScenario, Scenario, Strategy } from 'src/types'
import { HighBandwidthWallet } from 'src/utils'

export async function parseStrategy(strategy: Strategy<RawScenario>): Promise<Strategy<Scenario>> {
  const usedNames = new Set<string>()
  const parsedStrategy: Strategy<Scenario> = { register: [], open: [], suspend: [], close: [] }

  for (const strKey in strategy) {
    const key = strKey as keyof Strategy<RawScenario>

    for (const scenario of strategy[key]) {
      const name = scenario.owner

      if (usedNames.has(name)) throw new Error(`Duplicated owner name: ${name}`)
      usedNames.add(name)

      const privateKey = solidityKeccak256(['string'], [name])
      const wallet = await new HighBandwidthWallet({ privateKey }).sync()

      parsedStrategy[key].push({
        ...scenario,
        owner: { name, wallet },
      })
    }
  }

  return parsedStrategy
}
