import { keccak256, parseUnits, AbiCoder, getBytes, randomBytes, toBigInt } from "ethers"
import { Asset } from "../../types"
import { getDispatcher, getProvider, getSigner } from "../../config"

export async function signRiskFactor(
  collateral: Array<Asset>,
  leverage: Asset,
): Promise<{
  collateral: Array<Asset>
  leverage: Asset
  riskFactor: bigint
  timestamp: number
  nonce: bigint
  signature: string
}> {
  const riskFactor: bigint = getRiskFactor(collateral, leverage)
  const timestamp: number = getCurrentTimestamp()
  const nonce: bigint = getCurrentNonce()
  const dispatcher: string = await (await getDispatcher()).getAddress()
  const chainId: bigint = await getChainId()

  const encoded = AbiCoder.defaultAbiCoder().encode(
    [
      'tuple(address token, uint256 amount)[] collateral',
      'tuple(address token, uint256 amount) leverage',
      'uint256 riskFactor',
      'uint256 timestamp',
      'uint256 nonce',
      'address factory',
      'uint256 chainId',
    ],
    [collateral, leverage, riskFactor, timestamp, nonce, dispatcher, chainId],
  )

  const hashed: Uint8Array = getBytes(keccak256(encoded))
  const signature: string = await getSigner().signMessage(hashed)

  return {
    collateral,
    leverage,
    timestamp,
    riskFactor,
    nonce,
    signature,
  }
}

function getRiskFactor(_collateral: Array<Asset>, _leverage: Asset): bigint {
  return parseUnits('1.5', 32)
}

function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

function getCurrentNonce(): bigint {
  return toBigInt(randomBytes(32))
}

async function getChainId(): Promise<bigint> {
  return (await getProvider().getNetwork()).chainId
}
