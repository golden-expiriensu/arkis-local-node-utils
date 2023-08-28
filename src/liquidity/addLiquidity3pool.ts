import { Contract } from 'ethers'
import { Interface } from 'ethers/lib/utils'
import _3Pool from 'src/artifacts/3Pool.json'
import ERC20 from 'src/artifacts/IERC20.json'
import { MaybeTx, WalletLike } from 'src/types'
import { Treasure, getProvider } from 'src/utils'

const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const address3pool = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'

export async function addLiquidity3pool(
  treasure: Treasure,
  account: Contract,
  trader: WalletLike,
  amounts: { dai: string; usdc: string; usdt: string },
): Promise<void> {
  const abi = new Interface(_3Pool)

  const txs = await createTopUpTxs({ treasure, trader, account, amounts })
  await Promise.all(txs.filter((tx) => typeof tx !== 'undefined').map((tx) => tx?.wait()))

  const payload = abi.encodeFunctionData('add_liquidity', [[amounts.dai, amounts.usdc, amounts.usdt], 0])

  const tx = await account.connect(trader).execute({
    target: address3pool,
    value: 0,
    payload,
  })

  const receipt = await tx.wait()

  console.log('Successfully added liquidity to 3pool in block', receipt.blockNumber)
}

async function createTopUpTxs(arg: {
  treasure: Treasure
  trader: WalletLike
  account: Contract
  amounts: { dai: string; usdc: string; usdt: string }
}): Promise<Array<MaybeTx>> {
  return Promise.all(
    [
      arg.treasure.topUpEthBalance(arg.trader.address, 0),
      arg.treasure.topUpTokenBalance(new Contract(DAI, ERC20, getProvider()), arg.account.address, arg.amounts.dai),
      arg.treasure.topUpTokenBalance(new Contract(USDC, ERC20, getProvider()), arg.account.address, arg.amounts.usdc),
      arg.treasure.topUpTokenBalance(new Contract(USDT, ERC20, getProvider()), arg.account.address, arg.amounts.usdt),
    ].filter((tx) => typeof tx !== 'undefined'),
  )
}
