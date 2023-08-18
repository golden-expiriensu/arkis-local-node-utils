import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber, Contract, ContractTransaction, Wallet, constants } from 'ethers'
import ERC20 from '../artifacts/IERC20.json'
import { fetchAccountBorrowed } from '../events/fetchAccountBorrowed'
import { AccountConfig } from '../types'
import { getAddress, topUpBalance, topUpTokenBalance } from '../utils'
import { calculateRiskFactor } from './marginEngine'

function isETH(token: string): boolean {
  return token.toLowerCase() === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
}

export async function registerMarginAccount(config: AccountConfig, factory: Contract): Promise<string> {
  const trader = new Wallet(config.ownerPrivateKey, factory.provider)

  const metadata = await calculateRiskFactor(config.collateral, config.leverage)
  const ethValue = await setBalancesAndApprove(trader, config.collateral, factory)

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

  const events = await fetchAccountBorrowed(blockNumber, trader.address)
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

  const promises = new Array<Promise<TransactionResponse | null>>()

  for (const asset of assets) {
    if (isETH(asset.token)) {
      promises.push(topUpBalance(account.address, asset.amount))
    } else {
      promises.push(topUpTokenBalanceAndApprove(asset.token, account, asset.amount, factory.address))
    }
  }
  if (ethValue.eq(0)) promises.push(topUpBalance(account.address, '0'))

  const txs = await Promise.all(promises)
  await Promise.all(txs.map((tx) => tx?.wait()))

  return ethValue
}

async function topUpTokenBalanceAndApprove(
  tokenAddress: string,
  account: Wallet,
  amount: string,
  approvee: string,
): Promise<ContractTransaction | null> {
  const token = new Contract(tokenAddress, ERC20, account)

  const tx = await topUpTokenBalance(token, account.address, amount)

  const allowance: BigNumber = await token.allowance(account.address, approvee)
  if (allowance.lt(amount)) {
    return await token.connect(account).approve(approvee, constants.MaxUint256)
  }

  return tx
}
