import { Contract, parseUnits } from "ethers";
import { TOKENS, getProvider, getAbi } from "../config";
import { Asset } from "../types";

const regex = /^([1-9]\d*\.?\d*)\s(\w+)$/

export function parseAsset(str: string): Asset {
  const match = regex.exec(str)
  if (!match) {
    throw new Error(`Invalid format for asset, expected '<amount> <token>', got '${str}'`)
  }
  const amountStr = match[1]
  const symbol = match[2]

  if (symbol in TOKENS) {
    const token = TOKENS[symbol]
    const amount = parseUnits(amountStr, token.decimals)
    return {
      abi: new Contract(token.address, getAbi('erc20'), getProvider()),
      token: token.address,
      amount,
    }
  }
  throw new Error(`Unknown token: ${symbol}, beware that search is case sensitive. If ${symbol} is a correct token then you should add it to config`)
}
