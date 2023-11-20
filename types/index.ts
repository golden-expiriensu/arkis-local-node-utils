import { Contract } from 'ethers'

export type Asset = {
  abi: Contract
  token: string
  symbol: string
  decimals: number
  amount: bigint
}

export type Command = {
  target: string
  value: bigint
  payload: string
}
