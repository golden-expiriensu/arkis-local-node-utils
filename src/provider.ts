require('dotenv').config()

import axios from 'axios'
import { ethers } from 'ethers'
import { getAddress } from 'ethers/lib/utils'

export async function getFactoryAddress(): Promise<string> {
  const res = await axios.get(getEndpoint('factoryAddress'))
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

export function getEndpoint(name: 'setStorageAt' | 'setBalance' | 'factoryAddress' | 'synchronizationBlock'): string {
  return `${getServerUrl()}/${name}`
}

export function getServerUrl(): string {
  return process.env.SERVER_URL ?? getProviderUrl()
}
