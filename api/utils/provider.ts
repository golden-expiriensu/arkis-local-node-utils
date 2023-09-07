require('dotenv').config()

import { ethers } from 'ethers'

export function getProvider(): ethers.providers.Provider {
  return new ethers.providers.JsonRpcProvider(getProviderUrl())
}
export function getJsonProvider(): ethers.providers.JsonRpcProvider {
  return new ethers.providers.JsonRpcProvider(getProviderUrl())
}

export function getProviderUrl(): string {
  const url = process.env.LOCAL_NODE_URL
  if (!url) throw new Error('LOCAL_NODE_URL is not set in .env')
  return url
}
