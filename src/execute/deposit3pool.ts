import { getProvider } from '../provider'
import ERC20 from '../artifacts/IERC20.json'
import MarginAccountImplementation from '../artifacts/MarginAccountImplementation.json'
import { BigNumber, Contract, Signer, Wallet } from 'ethers'
import accountConfig from '../account.json'
import { Interface, formatUnits, parseEther } from 'ethers/lib/utils'
import { setBalance, setTokenBalance } from '../utils'

export async function addLiquidity3pool(
  accountAddress: string,
  amounts: { dai: string; usdc: string; usdt: string },
): Promise<void> {
  const account = new Contract(accountAddress, MarginAccountImplementation.abi, getProvider())
  const trader = new Wallet(accountConfig.traderPrivateKey, getProvider())

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

  await transferTokenIfNotEnough(trader, account, '0x6B175474E89094C44Da98b954EedeAC495271d0F', amounts.dai)
  await transferTokenIfNotEnough(trader, account, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', amounts.usdc)
  await transferTokenIfNotEnough(trader, account, '0xdAC17F958D2ee523a2206206994597C13D831ec7', amounts.usdt)

  const payload = abi.encodeFunctionData('add_liquidity', [[amounts.dai, amounts.usdc, amounts.usdt], 0])

  await setBalance(trader.address, parseEther('10').toHexString())

  await account.connect(trader).execute({
    target: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
    value: 0,
    payload,
  })

  console.log('successfully added liquidity to 3pool')
}

async function transferTokenIfNotEnough(
  from: Wallet,
  to: Contract,
  tokenAddress: string,
  amount: string,
): Promise<void> {
  const token = new Contract(tokenAddress, ERC20, to.provider)

  const amountbn = BigNumber.from(amount)
  const balance = await token.balanceOf(from.address)

  if (amountbn.gt(balance)) {
    const decimals = await token.decimals()
    const symbol = await token.symbol()

    console.log(
      `Not enough ${symbol} on account:\n  - have ${formatUnits(balance, decimals)}\n  - need ${formatUnits(
        amountbn,
        decimals,
      )}`,
    )
    console.log(`Transferring ${formatUnits(amountbn.sub(balance), decimals)} of ${symbol} to account...`)
    await setTokenBalance(token, from, amountbn.toHexString())
    await token.connect(from).transfer(to.address, amountbn.sub(balance))
  }
}

async function main() {
  const address = process.argv[2]

  await addLiquidity3pool(address, {
    dai: '1000000000000000000000',
    usdc: '1000000000',
    usdt: '1000000000',
  })
}

main()
