import { TransactionRequest, Wallet } from 'ethers'
import { getProvider } from '../config'

export class ConcurrentWallet extends Wallet {
  readonly provider = getProvider()

  private nonce?: number | undefined

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    transaction.nonce = await this.getNonceAndIncrement()
    return super.signTransaction(transaction)
  }

  async getNonceAndIncrement(): Promise<number> {
    if (typeof this.nonce === 'undefined') {
      this.nonce = await this.provider.getTransactionCount(this.address)
    }
    return this.nonce++
  }
}
