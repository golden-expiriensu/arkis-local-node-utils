import { getTreasure } from "../../config";
import { Asset } from "../../types";
import { signRiskFactor } from "./signRiskFactor";

export async function register(owner: string, collateral: Asset[], leverage: Asset): Promise<void> {
  const treasure = getTreasure()
  const metadata = await signRiskFactor(collateral, leverage)
  console.log(await treasure.getAddress())
  console.log(metadata.signature)
}
