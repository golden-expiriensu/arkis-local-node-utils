import { ethers } from 'ethers'
import axios from 'axios'
import { getAddress } from 'ethers/lib/utils'

export function getProvider(): ethers.providers.Provider {
  return new ethers.providers.JsonRpcProvider(getProviderUrl())
}

export function getProviderUrl(): string {
  const url = process.env.LOCAL_NODE_URL
  if (!url) throw new Error('LOCAL_NODE_URL is not set in .env')
  return url
}

export async function getFactoryAddress(): Promise<string> {
  const res = await axios.get(getProviderUrl() + '/address/marginAccount')
  return getAddress(res.data)
}
