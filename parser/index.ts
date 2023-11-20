import { Contract, parseUnits } from 'ethers'
import { getToken, getProvider, getAbi } from '../config'
import { Asset } from '../types'

const regex = /^([1-9]\d*\.?\d*)\s(\w+)$/

export function parseAsset(str: string): Asset {
  const match = regex.exec(str)
  if (!match) {
    throw new Error(`invalid format for asset, expected '<amount> <token>', got '${str}'`)
  }
  const amountStr = match[1]
  const symbol = match[2]

  const token = getToken(symbol)
  const amount = parseUnits(amountStr, token.decimals)
  return {
    abi: new Contract(token.address, getAbi('erc20'), getProvider()),
    token: token.address,
    symbol,
    decimals: token.decimals,
    amount,
  }
}
