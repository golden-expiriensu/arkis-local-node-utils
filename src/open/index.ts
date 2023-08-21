import { Contract } from 'ethers'
import { Logger } from 'src/logger'
import { Scenario } from 'src/types'
import { Treasure } from 'src/utils'
import { createAllocationPlan } from './createAllocationPlan'
import { mintLeverage } from './topUpFactoryBalance'

export async function openMarginAccount(
  treasure: Treasure,
  scenario: Scenario,
  factory: Contract,
  account: string,
): Promise<string> {
  const logger = new Logger(scenario)

  logger.log('Submitting allocation plan...')

  const res = await mintLeverage({ scenario, treasure, mintTo: factory })
  if (res) await res.wait()

  logger.log('Added leverage to factory to supply margin account')

  const tx = await factory.submitPlan(createAllocationPlan(account, scenario))
  const receipt = await tx.wait()

  logger.log(`Margin account was supplied with leverage in block ${receipt.blockNumber} and is now open`)

  return account
}
