import { AbstractSigner, JsonRpcProvider, Provider, Signer, TransactionRequest, TransactionResponse, TypedDataDomain, TypedDataField, isAddress } from "ethers"

export class ImpersonatedSigner extends AbstractSigner {
  private impersonationPromise: Promise<any>
  private nonce?: number | undefined

  constructor(
    public address: string,
    public readonly provider: JsonRpcProvider,
  ) {
    super()
    if (!isAddress(address)) throw new Error(`ImpersonatedSigner: invalid address: ${address}`)
    this.impersonationPromise = provider.send('anvil_impersonateAccount', [address])
  }

  async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
    const tx = await this.populateTransaction(transaction)
    tx.nonce = await this.getNonceAndIncrement()

    const hash = await this.provider.send('eth_sendTransaction', [tx])
    const maybeTx = await this.provider.getTransaction(hash)
    if (!maybeTx) throw new Error('ImpersonatedSigner: transaction not found')
    return maybeTx
  }

  async getNonceAndIncrement(): Promise<number> {
    if (typeof this.nonce === 'undefined') {
      await this.impersonationPromise
      this.nonce = await this.provider.getTransactionCount(this.address)
    }
    return this.nonce++
  }

  async getAddress(): Promise<string> {
    return this.address
  }

  signTransaction(_tx: TransactionRequest): Promise<string> {
    throw new Error('ImpersonatedSigner: cannot sign transactions')
  }
  signMessage(_message: string | Uint8Array): Promise<string> {
    throw new Error('ImpersonatedSigner does not support signing messages')
  }
  signTypedData(_domain: TypedDataDomain, _types: Record<string, Array<TypedDataField>>, _value: Record<string, any>): Promise<string> {
    throw new Error('ImpersonatedSigner does not support signing typed data')
  }
  connect(_provider: Provider | null): Signer {
    throw new Error('ImpersonatedSigner does not support connecting to a non-JsonRpcProvider provider')
  }
}
