import { formatUnits, parseEther, parseUnits } from 'ethers/lib/utils'
import factoryArtifact from '../MarginAccountFactory.json'
import { Contract, Wallet } from 'ethers'
import { calculateRiskFactor } from './marginEngine'
import { getFactoryAddress, getProvider } from '../provider'

async function main() {
  const user = new Wallet('0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba', getProvider())
  const factory = new Contract(await getFactoryAddress(), factoryArtifact.abi, getProvider())

  const ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

  const response = await calculateRiskFactor(
    [
      {
        token: ETH,
        amount: parseEther('10'),
      },
    ],
    {
      token: USDT,
      amount: parseUnits('250000', 6),
    },
  )

  if (Number(formatUnits(response.riskFactor, 32)) < 1.0) throw new Error('Risk factor is less than 1')

  await factory
    .connect(user)
    .registerMarginAccount(
      user.address,
      response.collateral,
      response.leverage,
      response.riskFactor,
      response.timestamp,
      response.nonce,
      response.signature,
      { value: parseEther('10') },
    )
}

main()
