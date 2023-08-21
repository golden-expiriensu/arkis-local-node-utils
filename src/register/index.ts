import { BigNumber, Contract, ContractTransaction } from 'ethers'
import { Logger } from 'src/logger'
import { Scenario } from 'src/types'
import { Treasure, fetchRegisteredAccount } from 'src/utils'
import { calculateRiskFactor } from './marginEngine'
import { topUpBalancesAndMakeApprovals } from './utils'

export async function registerMarginAccount(
  treasure: Treasure,
  scenario: Scenario,
  factory: Contract,
): Promise<string> {
  const logger = new Logger(scenario)
  logger.log('Registering margin account...')

  const metadata = await calculateRiskFactor(scenario.collateral, scenario.leverage)
  const ethValue = await topUpBalancesAndMakeApprovals(treasure, scenario, factory)

  logger.log('All balances and approvals are set, ready to register account')

  const tx: ContractTransaction = await factory
    .connect(scenario.owner.wallet)
    .registerMarginAccount(
      metadata.collateral,
      metadata.leverage,
      metadata.riskFactor,
      metadata.timestamp,
      metadata.nonce,
      metadata.signature,
      { value: ethValue },
    )

  const receipt = await tx.wait()
  const blockNumber = BigNumber.from(receipt.blockNumber).toHexString()

  const account = await fetchRegisteredAccount(blockNumber, scenario.owner.wallet.address)
  if (!account) throw new Error(`Could not fetch registered account for ${scenario.owner.name}`)

  logger.log(`New margin account ${account} registered in block ${receipt.blockNumber}`)

  return account
}
