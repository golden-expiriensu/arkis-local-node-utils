import { Contract, Signer } from "ethers";
import { getAbi, getPoolRegistry, getProvider } from "../../config";
import { maxApprove } from "../../wallet";

export async function depositToPool(
  asset: {
    token: string,
    amount: bigint,
  },
  treasure: Signer,
): Promise<void> {
  const registry = await getPoolRegistry()
  const poolAddress = await registry.getPool(asset.token)
  const pool = new Contract(poolAddress, getAbi('pool'), treasure)
  const token = new Contract(asset.token, getAbi('erc20'), getProvider())

  if (await token.balanceOf(poolAddress) >= asset.amount) {
    console.log(`${await token.symbol()} pool already has enough balance`)
    return
  }

  await maxApprove({
    from: treasure,
    to: poolAddress,
    token,
  })

  console.log(`Depositing ${await token.symbol()} to liquidity pool...`)
  const tx = await pool.deposit(asset.amount, [])
  await tx.wait()
}
