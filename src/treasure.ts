import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ExternallyOwnedAccount } from '@ethersproject/abstract-signer'
import { BigNumber, Contract, ContractTransaction, Signer } from 'ethers'

import { parseEther } from 'ethers/lib/utils'
import { getProvider } from './provider'

export class Treasure {
  constructor(private wallet: Signer & ExternallyOwnedAccount) {}

  async topUpTokenBalance(
    token: Contract,
    account: string,
    upToAmount: string | BigNumber,
  ): Promise<ContractTransaction | null> {
    console.log(`${account}---> Topping up ${token.address} balance up to amount ${upToAmount}`)

    const target = BigNumber.from(upToAmount)
    const currentBalance = await token.balanceOf(account)
    if (currentBalance.gt(target)) return null

    return token.connect(this.wallet).transfer(account, target.sub(currentBalance))
  }

  async topUpEthBalance(
    account: string,
    upToAmount: string | BigNumber,
    includeGas = true,
  ): Promise<TransactionResponse | null> {
    console.log(
      `${account}---> Topping up ETH balance up to amount ${upToAmount}${includeGas ? ' + gas expenses' : ''}`,
    )

    let target = BigNumber.from(upToAmount)
    if (includeGas) target = target.add(parseEther('1'))

    const currentBalance = await getProvider().getBalance(account)
    if (currentBalance.gt(target)) return null

    return this.wallet.sendTransaction({
      to: account,
      value: target.sub(currentBalance),
    })
  }
}
