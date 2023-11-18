import { JsonRpcProvider, Signer, Wallet } from "ethers";
import { ConcurrentWallet } from "../wallet";

export function getProvider(): JsonRpcProvider {
  const key = 'ETHEREUM_URL'
  const url = process.env[key] ?? throwNotSet('RPC provider', key)
  return new JsonRpcProvider(url)
}

export function getSigner(): Signer {
  const key = 'SIGNER_PRIVATE_KEY'
  const privateKey = process.env[key] ?? throwNotSet('signer', key)
  return new Wallet(privateKey)
}

export function getOwner(): Signer {
  const key = 'MARGIN_ENGINE_PRIVATE_KEY'
  const privateKey = process.env[key] ?? throwNotSet('owner', key)
  return new ConcurrentWallet(privateKey, getProvider())
}

export function getTreasure(): Signer {
  const key = 'TREASURE_PRIVATE_KEY'
  const privateKey = process.env[key] ?? throwNotSet('treasure', key)
  return new ConcurrentWallet(privateKey, getProvider())
}

export function getServerUrl(): string {
  const key = 'SERVER_URL'
  return process.env[key] ?? throwNotSet('HTTP connection', key)
}

function throwNotSet(subj: string, key: string): never {
  throw new Error(`can't create ${subj}: ${key} is not set in .env`)
}
