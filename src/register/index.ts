import { formatUnits } from 'ethers/lib/utils'
import { calculateRiskFactor } from './marginEngine'
import account from '../account.json'
import { constants } from 'ethers'
import { getEndpoint } from '../getEndpoint'
import axios from 'axios'

function isETH(token: string): boolean {
  return token.toLowerCase() === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
}

async function generateRegisterBody(): Promise<Object> {
  const response = await calculateRiskFactor(account.collateral, account.leverage)

  if (Number(formatUnits(response.riskFactor, 32)) < 1.0) throw new Error('Risk factor too low')

  const value = account.collateral.reduce((prev, curr) => {
    return isETH(curr.token) ? prev.add(curr.amount) : prev
  }, constants.Zero)

  return {
    from: account.owner,
    value,
    request: { for: account.owner, ...response },
  }
}

async function main(): Promise<void> {
  const response = await axios.post(getEndpoint('register'), await generateRegisterBody())
  console.log(response.data)
}

main()
