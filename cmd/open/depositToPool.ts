import { Contract, Signer } from 'ethers'
import { getAbi, getPoolRegistry, getProvider } from '../../config'
import { maxApprove } from '../../wallet'

export async function depositToPool(
  asset: {
    token: string
    amount: bigint
  },
  treasure: Signer,
): Promise<void> {
  const registry = await getPoolRegistry()
  const poolAddress = await registry.getPool(asset.token)
  const pool = new Contract(poolAddress, getAbi('pool'), treasure)
  const token = new Contract(asset.token, getAbi('erc20'), getProvider())

  if ((await token.balanceOf(poolAddress)) >= asset.amount) {
    console.log(`${await token.symbol()} pool already has enough balance`)
    return
  }

  await maxApprove({
    from: treasure,
    to: poolAddress,
    token,
  })

  console.log(`Depositing ${await token.symbol()} to liquidity pool...`)
  try {
    const tx = await pool.deposit(asset.amount, [])
    await tx.wait()
  } catch (err) {
    if (err.info.error.data === '0xc4c6ecd9') {
      throw new Error(
        `Total deposit threshold in ${await token.symbol()} pool has been exceeded, either use different token as leverage, increase threshold or return allocated money to pool`,
      )
    }
    console.log(err)
    throw err
  }
  console.log('Deposited successfully, leverage can be allocated')
}
