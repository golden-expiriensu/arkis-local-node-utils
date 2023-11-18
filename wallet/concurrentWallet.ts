import { TransactionRequest, Wallet, toBigInt } from 'ethers'
import { getProvider } from '../config'

export class ConcurrentWallet extends Wallet {
  readonly provider = getProvider()

  private nonce?: number | undefined

  async signTransaction(tx: TransactionRequest): Promise<string> {
    this.incrementNonce(tx)
    // NOTE: Set this to 10 mil just in case. I have been debugging 5 hours straight
    // just to realize anvil (or ethers@6?) can't properly estimate a gas limit 💀
    if (toBigInt(tx.gasLimit ?? 0) < 10_000_000n) tx.gasLimit = '0x999999'
    return super.signTransaction(tx)
  }

  incrementNonce(tx: TransactionRequest): void {
    if (typeof this.nonce === 'undefined') {
      this.nonce = tx.nonce!
    }
    tx.nonce = this.nonce++
  }
}
