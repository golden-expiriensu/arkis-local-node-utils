import { formatUnits } from 'ethers/lib/utils'
import { calculateRiskFactor } from './marginEngine'
import account from '../account.json'
import { Contract, constants } from 'ethers'
import { fetchAccountBorrowed } from '../events/fetchAccountBorrowed'
import { getAddress } from '../utils'

function isETH(token: string): boolean {
  return token.toLowerCase() === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
}

export async function registerMarginAccount(factory: Contract): Promise<string> {
  const res = await calculateRiskFactor(account.collateral, account.leverage)

  if (Number(formatUnits(res.riskFactor, 32)) < 1.0) throw new Error('Risk factor too low')

  const value = account.collateral.reduce((prev, curr) => {
    return isETH(curr.token) ? prev.add(curr.amount) : prev
  }, constants.Zero)

  await factory.registerMarginAccount(
    res.collateral,
    res.leverage,
    res.riskFactor,
    res.timestamp,
    res.nonce,
    res.signature,
    { value },
  )

  const events = await fetchAccountBorrowed('latest')
  const addressBytes32 = events[0].topics[1]

  if (!addressBytes32) throw new Error('Failed to register margin account')
  console.log(`New margin account registered ${getAddress(addressBytes32)}`)

  return addressBytes32
}
