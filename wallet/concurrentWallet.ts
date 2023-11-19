import { TransactionRequest, Wallet } from 'ethers'
import { getProvider } from '../config'

export class ConcurrentWallet extends Wallet {
  readonly provider = getProvider()

  private nonce?: number | undefined

  async signTransaction(tx: TransactionRequest): Promise<string> {
    this.incrementNonce(tx)
    return super.signTransaction(tx)
  }

  incrementNonce(tx: TransactionRequest): void {
    if (typeof this.nonce === 'undefined') {
      this.nonce = tx.nonce!
    }
    tx.nonce = this.nonce++
  }
}
