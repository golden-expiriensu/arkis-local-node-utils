import { Asset } from "../../types";
import { signRiskFactor } from "./signRiskFactor";

export async function register(owner: string, collateral: Asset[], leverage: Asset): Promise<void> {
  const metadata = await signRiskFactor(collateral, leverage)
}
