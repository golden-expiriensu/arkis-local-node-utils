import { Contract } from 'ethers'

export type Asset = {
  abi: Contract
  token: string
  amount: bigint
}
