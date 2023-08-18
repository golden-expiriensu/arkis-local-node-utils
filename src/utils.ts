import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber, Contract, ContractTransaction, Wallet, utils } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { getProvider } from './provider'

const treasure = Wallet.fromMnemonic('test test test test test test test test test test test junk', `m/44'/60'/0'/0/4`)

export function getAddress(address: string): string {
  return utils.getAddress(address.replace('0x000000000000000000000000', '0x'))
}

export async function topUpTokenBalance(
  token: Contract,
  account: string,
  upToAmount: string | BigNumber,
): Promise<ContractTransaction | null> {
  const target = BigNumber.from(upToAmount)
  const currentBalance = await token.balanceOf(account)
  if (currentBalance.gt(target)) return null

  return await token.connect(treasure).transfer(account, target.sub(currentBalance))
}

export async function topUpBalance(
  account: string,
  upToAmount: string | BigNumber,
  topUpForGasAsWell = true,
): Promise<TransactionResponse | null> {
  let target = BigNumber.from(upToAmount)
  if (topUpForGasAsWell) target = target.add(parseEther('1'))
  const currentBalance = await getProvider().getBalance(account)
  if (currentBalance.gt(target)) return null

  return treasure.sendTransaction({
    to: account,
    value: target.sub(currentBalance),
  })
}
