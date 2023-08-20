import { Contract, Wallet } from 'ethers'
import { Interface } from 'ethers/lib/utils'
import ERC20 from '../artifacts/IERC20.json'
import MarginAccountImplementation from '../artifacts/MarginAccountImplementation.json'
import { getProvider } from '../provider'
import { Treasure } from '../treasure'

export async function addLiquidity3pool(
  treasure: Treasure,
  accountAddress: string,
  ownerPrivateKey: string,
  amounts: { dai: string; usdc: string; usdt: string },
): Promise<void> {
  const account = new Contract(accountAddress, MarginAccountImplementation.abi, getProvider())
  const trader = new Wallet(ownerPrivateKey, getProvider())

  const abi = new Interface([
    {
      name: 'add_liquidity',
      outputs: [],
      inputs: [
        { type: 'uint256[3]', name: 'amounts' },
        { type: 'uint256', name: 'min_mint_amount' },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ])

  const txs = await Promise.all([
    treasure.topUpEthBalance(trader.address, '0'),
    treasure.topUpTokenBalance(
      new Contract('0x6B175474E89094C44Da98b954EedeAC495271d0F', ERC20, getProvider()),
      account.address,
      amounts.dai,
    ),
    treasure.topUpTokenBalance(
      new Contract('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', ERC20, getProvider()),
      account.address,
      amounts.usdc,
    ),
    treasure.topUpTokenBalance(
      new Contract('0xdAC17F958D2ee523a2206206994597C13D831ec7', ERC20, getProvider()),
      account.address,
      amounts.usdt,
    ),
  ])
  await Promise.all(txs.map((tx) => tx?.wait()))

  const payload = abi.encodeFunctionData('add_liquidity', [[amounts.dai, amounts.usdc, amounts.usdt], 0])

  const tx = await account.connect(trader).execute({
    target: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
    value: 0,
    payload,
  })

  const receipt = await tx.wait()

  console.log('Successfully added liquidity to 3pool in block number', receipt.blockNumber)
}

async function main() {
  const address = process.argv[2]
  const ownerPrivateKey = process.argv[3]

  const treasure = new Treasure()
  await treasure.init()

  await addLiquidity3pool(treasure, address, ownerPrivateKey, {
    dai: '1000000000000000000000',
    usdc: '1000000000',
    usdt: '1000000000',
  })
}

main()
