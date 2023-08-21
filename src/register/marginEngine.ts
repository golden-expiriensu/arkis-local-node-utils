import { BigNumber, Signer, Wallet } from 'ethers'
import { arrayify, defaultAbiCoder, keccak256, parseUnits } from 'ethers/lib/utils'
import { getFactoryAddress, getProvider } from 'src/utils'

type Asset = {
  token: string
  amount: string
}

export async function calculateRiskFactor(
  collateral: Array<Asset>,
  leverage: Asset,
): Promise<{
  collateral: Array<Asset>
  leverage: Asset
  riskFactor: string
  timestamp: number
  nonce: string
  signature: string
}> {
  const riskFactor: string = getRiskFactor(collateral, leverage)
  const timestamp: number = getCurrentTimestamp()
  const nonce: string = getCurrentNonce()
  const factory: string = await getFactoryAddress()
  const chainId: number = await getChainId()

  const encoded = defaultAbiCoder.encode(
    [
      'tuple(address token, uint256 amount)[] collateral',
      'tuple(address token, uint256 amount) leverage',
      'uint256 riskFactor',
      'uint256 timestamp',
      'uint256 nonce',
      'address factory',
      'uint256 chainId',
    ],
    [collateral, leverage, riskFactor, timestamp, nonce, factory, chainId],
  )

  const hashed = keccak256(encoded)

  const signature = await getSigner().signMessage(arrayify(hashed))

  return {
    collateral,
    leverage,
    timestamp,
    riskFactor,
    nonce,
    signature,
  }
}

function getRiskFactor(_collateral: Array<Asset>, _leverage: Asset): string {
  return parseUnits('1.5', 32).toHexString()
}

function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

function getCurrentNonce(): string {
  return BigNumber.from(Math.floor(Math.random() * 1000000)).toHexString()
}

async function getChainId(): Promise<number> {
  return (await getProvider().getNetwork()).chainId
}

function getSigner(): Signer {
  const privateKey = process.env.SIGNER_PRIVATE_KEY
  if (!privateKey) throw new Error('SIGNER_PRIVATE_KEY is not set in .env')
  return new Wallet(privateKey)
}
