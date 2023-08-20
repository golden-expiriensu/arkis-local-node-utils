import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber, Contract, ContractTransaction, Wallet } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { getProvider } from './provider'

export class Treasure {
  private readonly wallet = Wallet.fromMnemonic(
    'test test test test test test test test test test test junk',
    `m/44'/60'/0'/0/4`,
  ).connect(getProvider())

  private nonce: number | undefined

  get initialized(): boolean {
    return this.nonce !== undefined
  }

  async init(): Promise<void> {
    this.nonce = await this.wallet.getTransactionCount()
  }

  async topUpTokenBalance(
    token: Contract,
    account: string,
    upToAmount: string | BigNumber,
  ): Promise<ContractTransaction | null> {
    if (!this.initialized) throw new Error('Treasure not initialized')
    const nonce = this.nonce!++

    console.log(
      `${account}---> Topping up ${token.address} balance up to amount ${upToAmount}
                                               Treasure (${this.wallet.address}) nonce: ${nonce}`,
    )

    const target = BigNumber.from(upToAmount)
    const currentBalance = await token.balanceOf(account)
    if (currentBalance.gt(target)) return null

    return token.connect(this.wallet).transfer(account, target.sub(currentBalance), { nonce })
  }

  async topUpBalance(
    account: string,
    upToAmount: string | BigNumber,
    topUpForGasAsWell = true,
  ): Promise<TransactionResponse | null> {
    if (!this.initialized) throw new Error('Treasure not initialized')
    const nonce = this.nonce!++

    console.log(
      `${account}---> Topping up ETH balance up to amount ${upToAmount}${topUpForGasAsWell ? ' + gas expenses' : ''}
                                               Treasure (${this.wallet.address}) nonce: ${nonce}`,
    )

    let target = BigNumber.from(upToAmount)
    if (topUpForGasAsWell) target = target.add(parseEther('1'))
    const currentBalance = await getProvider().getBalance(account)
    if (currentBalance.gt(target)) return null

    return this.wallet.sendTransaction({
      to: account,
      value: target.sub(currentBalance),
      nonce,
    })
  }
}
