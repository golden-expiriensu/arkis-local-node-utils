import { formatUnits, parseEther, parseUnits } from 'ethers/lib/utils'
import { calculateRiskFactor } from './marginEngine'
require('dotenv').config()

async function main() {
  const user = '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'
  const value = parseEther('10.000000000000000000').toHexString()

  const ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

  const response = await calculateRiskFactor(
    [
      {
        token: ETH,
        amount: value,
      },
    ],
    {
      token: USDT,
      amount: parseUnits('250000.000000', 6).toHexString(),
    },
  )

  if (Number(formatUnits(response.riskFactor, 32)) < 1.0) throw new Error('Risk factor too low')

  console.log(
    JSON.stringify({
      from: user,
      value,
      request: { for: user, ...response },
    }),
  )
}

main()
