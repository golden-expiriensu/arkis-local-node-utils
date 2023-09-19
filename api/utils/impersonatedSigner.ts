import { Provider, TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider'
import { ExternallyOwnedAccount } from '@ethersproject/abstract-signer'
import { BigNumber, Bytes, Signer, ethers } from 'ethers'
import { Deferrable, isAddress } from 'ethers/lib/utils'

export class ImpersonatedSigner extends Signer implements ExternallyOwnedAccount {
  private impersonationPromise: Promise<any>
  private nonce?: number | undefined

  get privateKey(): string {
    throw new Error('ImpersonatedSigner does not have a private key')
  }

  constructor(
    public address: string,
    public readonly provider: ethers.providers.JsonRpcProvider,
  ) {
    super()
    if (!isAddress(address)) throw new Error('ImpersonatedSigner: invalid address')
    this.impersonationPromise = provider.send('anvil_impersonateAccount', [address])
  }

  async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    this._checkProvider('sendTransaction')
    const tx = await this.populateTransaction(transaction)
    tx.nonce = await this.getNonceAndIncrement()

    // @ts-ignore
    tx.type = BigNumber.from(tx.type).toHexString()
    // @ts-ignore
    tx.chainId = BigNumber.from(tx.chainId).toHexString()
    // @ts-ignore
    tx.maxFeePerGas = tx.maxFeePerGas.hex
    // @ts-ignore
    tx.value = tx.value?.hex ?? '0x00'
    // @ts-ignore
    tx.maxPriorityFeePerGas = tx.maxPriorityFeePerGas.hex
    // @ts-ignore
    tx.gasLimit = tx.gasLimit.hex

    const hash = await this.provider.send('eth_sendTransaction', [tx])
    return await this.provider.getTransaction(hash)
  }

  async getNonceAndIncrement(): Promise<string> {
    this._checkProvider('sendTransaction')
    if (typeof this.nonce === 'undefined') {
      await this.impersonationPromise
      this.nonce = await this.provider.getTransactionCount(this.address)
    }
    return BigNumber.from(this.nonce++).toHexString()
  }

  async getAddress(): Promise<string> {
    return this.address
  }
  signMessage(_message: string | Bytes): Promise<string> {
    throw new Error('ImpersonatedSigner: signMessage is not possible')
  }
  signTransaction(_transaction: Deferrable<TransactionRequest>): Promise<string> {
    throw new Error('ImpersonatedSigner: signTransaction is not possible')
  }

  connect(_provider: Provider): Signer {
    throw new Error('ImpersonatedSigner: connect is not possible')
  }
}
