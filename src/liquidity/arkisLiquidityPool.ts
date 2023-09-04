require('tsconfig-paths/register')

import axios from 'axios'
import { Contract, constants } from 'ethers'
import { formatUnits, isAddress, parseUnits } from 'ethers/lib/utils'
import IERC20 from 'src/artifacts/IERC20.json'
import Pool from 'src/artifacts/Pool.json'
import PoolRegistry from 'src/artifacts/PoolRegistry.json'
import { createTreasure } from 'src/execute/createTreasure'
import { getEndpoint, getOwner, getProvider } from 'src/utils'

async function main() {
  const tokenAddress = process.argv[2]
  if (!tokenAddress) throw new Error('Must specify token address')
  if (!isAddress(tokenAddress)) throw new Error('Token address must be a valid ethereum address')
  const token = new Contract(tokenAddress, IERC20, getProvider())

  console.log(`Token: ${await token.symbol()}`)

  const tokenAmount = process.argv[3]
  if (!tokenAmount) throw new Error('Must specify token amount')
  if (!Number.isInteger(tokenAmount)) throw new Error('Token amount must be an integer')
  const decimals = await token.decimals()
  const amount = parseUnits(tokenAmount, decimals)

  console.log(`Amount: ${formatUnits(amount, decimals)}`)

  const { data: liquidityPoolAddress } = await axios.get(getEndpoint('address/liquidityPool'))
  const liquidityPool = new Contract(liquidityPoolAddress, PoolRegistry.abi, getProvider())
  const poolAddress = await liquidityPool.getPoolAddress(tokenAddress)
  const pool = new Contract(poolAddress, Pool.abi, getProvider())

  const liquidityProvider = await getOwner()

  const treasure = await createTreasure()
  await treasure.topUpTokenBalance(token, liquidityProvider.address, amount)

  if (amount.gt(await token.allowance(liquidityProvider.address))) {
    console.log('Not enought allowance, increasing up to maximum...')
    await token.connect(liquidityProvider).approve(pool.address, constants.MaxUint256)
  }

  console.log('Preparation is done, ready to deposit to liqudity pool')

  await pool.connect(liquidityProvider).deposit(amount, [])

  console.log('Success!')
}

main()