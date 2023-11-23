import { BlockTag, Wallet } from 'ethers'
import { getProvider } from '../config'

export class ConcurrentWallet extends Wallet {
  readonly provider = getProvider()

  private nonce?: number | undefined
  private gettingNonce = false

  async getNonce(blockTag?: BlockTag): Promise<number> {
    if (typeof this.nonce === 'undefined') {
      if (this.gettingNonce) {
        return this.getNonce(blockTag)
      }
      this.gettingNonce = true
      this.nonce = await this.provider.getTransactionCount(await this.getAddress(), blockTag)
      this.gettingNonce = false
    }
    return this.nonce++
  }
}
