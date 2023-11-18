import { JsonRpcProvider } from "ethers";

export function getProvider(): JsonRpcProvider {
  const url = process.env.ETHEREUM_URL
  if (!url) {
    throw new Error("can't create RPC provider: ETHEREUM_URL is not set")
  }
  return new JsonRpcProvider(url)
}
