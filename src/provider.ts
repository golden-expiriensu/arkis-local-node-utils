require('dotenv').config()

import axios from 'axios'
import { Contract, Wallet, ethers } from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import Factory from './artifacts/MarginAccountFactory.json'

export async function getFactoryAsOwner(): Promise<Contract> {
  return new Contract(await getFactoryAddress(), Factory.abi, getOwner())
}

export function getOwner(): Wallet {
  return new Wallet('0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a', getProvider())
}

export async function getFactoryAddress(): Promise<string> {
  const res = await axios.get(getEndpoint('address/marginAccount'))
  return getAddress(res.data)
}

export function getProvider(): ethers.providers.Provider {
  return new ethers.providers.JsonRpcProvider(getProviderUrl())
}

export function getProviderUrl(): string {
  const url = process.env.LOCAL_NODE_URL
  if (!url) throw new Error('LOCAL_NODE_URL is not set in .env')
  return url
}

export function getEndpoint(
  name: 'setStorageAt' | 'setBalance' | 'address/marginAccount' | 'synchronizationBlock',
): string {
  return `${getServerUrl()}/${name}`
}

export function getServerUrl(): string {
  return process.env.SERVER_URL ?? getProviderUrl()
}
