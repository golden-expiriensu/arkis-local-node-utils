import { Contract } from 'ethers'
import { Logger } from 'src/logger'
import { Scenario } from 'src/types'
import { createLiquidationPlan } from './createLiquidationPlan'

export async function closeMarginAccount(
  scenario: Scenario,
  factory: Contract,
  account: string,
  onlySuspend = false,
): Promise<string> {
  const logger = new Logger(scenario)
  const liquidationPlan = createLiquidationPlan({ factory, onlySuspend, scenario })

  const tx = await factory.tryCloseMarginAccount(account, liquidationPlan)
  const receipt = await tx.wait()

  logger.log(
    `Margin account was ${onlySuspend ? 'suspended' : 'successfully liquidated'} in block ${receipt.blockNumber}`,
  )

  return account
}
