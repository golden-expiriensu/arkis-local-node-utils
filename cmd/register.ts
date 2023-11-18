import { Asset } from "../types";

export async function register(owner: string, leverage: Asset, collateral: Asset[]): Promise<void> {
  console.log(`Registering account for ${owner}: ${JSON.stringify({ leverage, collateral })}`)
}
