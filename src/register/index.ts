import { formatUnits } from 'ethers/lib/utils'
import { calculateRiskFactor } from './marginEngine'
import account from '../account.json'
import { BigNumber, Contract, ContractTransaction, Signer, constants } from 'ethers'
import { fetchAccountBorrowed } from '../events/fetchAccountBorrowed'
import { getAddress, setBalance, setTokenBalance } from '../utils'
import ERC20 from '../artifacts/IERC20.json'

function isETH(token: string): boolean {
  return token.toLowerCase() === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
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

export async function registerMarginAccount(factory: Contract): Promise<string> {
  const res = await calculateRiskFactor(account.collateral, account.leverage)

  if (Number(formatUnits(res.riskFactor, 32)) < 1.0) throw new Error('Risk factor too low')

  const value = account.collateral.reduce((prev, curr) => {
    return isETH(curr.token) ? prev.add(curr.amount) : prev
  }, constants.Zero)

  for (const collateral of account.collateral) {
    if (isETH(collateral.token)) {
      await setBalance(await factory.signer.getAddress(), constants.MaxUint256.toHexString())
    } else {
      await setTokenBalanceAndApprove(collateral.token, factory.signer, factory.address, collateral.amount)
    }
  }

  const tx: ContractTransaction = await factory.registerMarginAccount(
    account.owner,
    res.collateral,
    res.leverage,
    res.riskFactor,
    res.timestamp,
    res.nonce,
    res.signature,
    { value },
  )
  const receipt = await tx.wait()
  const blockNumber = BigNumber.from(receipt.blockNumber).toHexString()

  const events = await fetchAccountBorrowed(blockNumber)
  const addressBytes32 = events[0].topics[1]

  if (!addressBytes32) throw new Error('Failed to register margin account')
  console.log(`New margin account registered ${getAddress(addressBytes32)}`)

  return addressBytes32
}
