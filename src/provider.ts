import { ethers } from 'ethers'
import axios from 'axios'
import { getAddress } from 'ethers/lib/utils'

export function getProvider(): ethers.providers.Provider {
  return new ethers.providers.JsonRpcProvider(getProviderUrl())
}

export function getProviderUrl(): string {
  return 'http://localhost:4000/'
}

export async function getFactoryAddress(): Promise<string> {
  const res = await axios.get(getProviderUrl() + 'address/marginAccount')
  return getAddress(res.data.trim())
}
