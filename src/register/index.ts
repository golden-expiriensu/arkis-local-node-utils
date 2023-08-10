import { parseEther } from 'ethers/lib/utils'
import { calculateRiskFactor } from './marginEngine'
import account from '../account.json'
import { BigNumber, Contract, ContractTransaction, Signer, Wallet, constants } from 'ethers'
import { fetchAccountBorrowed } from '../events/fetchAccountBorrowed'
import { getAddress, setBalance, setTokenBalance } from '../utils'
import ERC20 from '../artifacts/IERC20.json'

function isETH(token: string): boolean {
  return token.toLowerCase() === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
}

export async function registerMarginAccount(factory: Contract): Promise<string> {
  const trader = new Wallet(account.traderPrivateKey, factory.provider)
  await setBalance(trader.address, parseEther('10').toHexString())

  const metadata = await calculateRiskFactor(account.collateral, account.leverage)
  const ethValue = await setBalancesAndApprove(trader, account.collateral, factory)

  const tx: ContractTransaction = await factory
    .connect(trader)
    .registerMarginAccount(
      metadata.collateral,
      metadata.leverage,
      metadata.riskFactor,
      metadata.timestamp,
      metadata.nonce,
      metadata.signature,
      { value: ethValue },
    )

  const receipt = await tx.wait()
  const blockNumber = BigNumber.from(receipt.blockNumber).toHexString()

  const events = await fetchAccountBorrowed(blockNumber)
  const addressBytes32 = events[0].topics[1]

  if (!addressBytes32) throw new Error('Failed to register margin account')
  console.log(`New margin account ${getAddress(addressBytes32)} registered in block ${blockNumber}`)

  return addressBytes32
}

async function setBalancesAndApprove(
  account: Wallet,
  assets: Array<{ token: string; amount: string }>,
  factory: Contract,
): Promise<BigNumber> {
  const ethValue = assets.reduce((prev, curr) => {
    return isETH(curr.token) ? prev.add(curr.amount) : prev
  }, constants.Zero)

  for (const asset of assets) {
    if (isETH(asset.token)) {
      await increaseEthBalance(account, asset.amount)
    } else {
      await setTokenBalanceAndApprove(asset.token, account, factory.address, asset.amount)
    }
  }

  return ethValue
}

async function increaseEthBalance(account: Signer, delta: string): Promise<void> {
  const newBalance = BigNumber.from(delta).add(await account.getBalance())
  await setBalance(await account.getAddress(), newBalance.toHexString())
}

async function setTokenBalanceAndApprove(
  tokenAddress: string,
  account: Signer,
  to: string,
  amount: string,
): Promise<void> {
  const token = new Contract(tokenAddress, ERC20, account)

  await setTokenBalance(token, await account.getAddress(), amount)

  if ((await token.allowance(await account.getAddress(), to)) < amount) {
    await token.approve(to, constants.MaxUint256)
  }
}
