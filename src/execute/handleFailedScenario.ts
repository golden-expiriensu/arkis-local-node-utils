import { Scenario } from 'src/types'

export function handleFailedScenario(scenario: Scenario, err: Error): void {
  console.error(
    `Failed to execute strategy for ${scenario.owner.name} (${scenario.owner.wallet.address}) because of the error:`,
    err.message,
  )
}
