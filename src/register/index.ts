import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber, Contract, ContractTransaction, Wallet, constants } from 'ethers'
import { hexZeroPad } from 'ethers/lib/utils'
import ERC20 from '../artifacts/IERC20.json'
import { fetchRegisteredAccount } from '../events/fetchAccountBorrowed'
import { Treasure } from '../treasure'
import { AccountConfig } from '../types'
import { calculateRiskFactor } from './marginEngine'

function isETH(token: string): boolean {
  return token.toLowerCase() === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
}

export async function registerMarginAccount(
  treasure: Treasure,
  config: AccountConfig,
  factory: Contract,
): Promise<string> {
  const trader = new Wallet(config.ownerPrivateKey, factory.provider)
  console.log(`${trader.address}---> Registering margin account...`)

  const metadata = await calculateRiskFactor(config.collateral, config.leverage)
  const ethValue = await setBalancesAndApprove(treasure, trader, config.collateral, factory)

  console.log(`${trader.address}---> All balances and approvals are set, ready to register account`)

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

  const account = await fetchRegisteredAccount(blockNumber, trader.address)
  if (!account) throw new Error(`Could not fetch registered account for ${trader.address}`)

  console.log(`${trader.address}---> New margin account ${account} registered in block ${blockNumber}`)

  return hexZeroPad(account, 32)
}

async function setBalancesAndApprove(
  treasure: Treasure,
  account: Wallet,
  assets: Array<{ token: string; amount: string }>,
  factory: Contract,
): Promise<BigNumber> {
  const ethValue = assets.reduce((prev, curr) => {
    return isETH(curr.token) ? prev.add(curr.amount) : prev
  }, constants.Zero)

  const promises = new Array<Promise<TransactionResponse | null>>()

  for (const asset of assets) {
    if (isETH(asset.token)) {
      promises.push(treasure.topUpBalance(account.address, asset.amount))
    } else {
      promises.push(topUpTokenBalanceAndApprove(treasure, asset.token, account, asset.amount, factory.address))
    }
  }
  if (ethValue.eq(0)) promises.push(treasure.topUpBalance(account.address, '0'))

  const txs = await Promise.all(promises)
  await Promise.all(txs.map((tx) => tx?.wait()))

  return ethValue
}

async function topUpTokenBalanceAndApprove(
  treasure: Treasure,
  tokenAddress: string,
  account: Wallet,
  amount: string,
  approvee: string,
): Promise<ContractTransaction | null> {
  const token = new Contract(tokenAddress, ERC20, account)

  const tx = await treasure.topUpTokenBalance(token, account.address, amount)

  const allowance: BigNumber = await token.allowance(account.address, approvee)
  if (allowance.lt(amount)) {
    return await token.connect(account).approve(approvee, constants.MaxUint256)
  }

  return tx
}
