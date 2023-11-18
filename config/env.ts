import { JsonRpcProvider, Signer, Wallet } from "ethers";

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

export function getServerUrl(): string {
  const key = 'SERVER_URL'
  return process.env[key] ?? throwNotSet('HTTP connection', key)
}

function throwNotSet(subj: string, key: string): never {
  throw new Error(`can't create ${subj}: ${key} is not set in .env`)
}
