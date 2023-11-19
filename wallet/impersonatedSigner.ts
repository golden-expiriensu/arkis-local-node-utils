import {
  AbstractSigner,
  JsonRpcProvider,
  Provider,
  Signer,
  TransactionRequest,
  TransactionResponse,
  TypedDataDomain,
  TypedDataField,
  isAddress,
  toBeHex,
} from 'ethers'

export class ImpersonatedSigner extends AbstractSigner {
  private nonce?: number | undefined

  constructor(
    public address: string,
    public readonly provider: JsonRpcProvider,
  ) {
    super()
    if (!isAddress(address)) throw new Error(`ImpersonatedSigner: invalid address: ${address}`)
  }

  async sync(): Promise<ImpersonatedSigner> {
    await this.provider.send('anvil_impersonateAccount', [this.address])
    this.nonce = await this.provider.getTransactionCount(this.address)
    return this
  }

  async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
    const tx = await this.populateTransaction(transaction)
    this.incrementNonce(tx)

    // We set all the fields in transaction as hex string because overwise
    // JsonRpcProvider complains about unexpected types number and bigint.
    // @ts-ignore
    tx.type = toBeHex(tx.type ?? 0)
    tx.chainId = toBeHex(tx.chainId ?? 1)
    tx.maxFeePerGas = toBeHex(tx.maxFeePerGas ?? 0)
    tx.maxPriorityFeePerGas = toBeHex(tx.maxPriorityFeePerGas ?? 0)
    // If gasLimit field present then anvil throws following error:
    // ... unknown field `gasLimit`, expected one of `to`, `data`, ...
    tx.gasLimit = undefined
    tx.value = toBeHex(tx.value ?? 0)
    // @ts-ignore
    tx.nonce = toBeHex(tx.nonce ?? 0)

    const hash = await this.provider.send('eth_sendTransaction', [tx])
    const maybeTx = await this.provider.getTransaction(hash)

    if (!maybeTx) throw new Error('ImpersonatedSigner: transaction not found')
    return maybeTx
  }

  incrementNonce(tx: TransactionRequest): void {
    if (typeof this.nonce === 'undefined') {
      throw new Error('ImpersonatedSigner: nonce is not synchronized')
    }
    tx.nonce = this.nonce++
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
  signTypedData(
    _domain: TypedDataDomain,
    _types: Record<string, Array<TypedDataField>>,
    _value: Record<string, any>,
  ): Promise<string> {
    throw new Error('ImpersonatedSigner does not support signing typed data')
  }
  connect(_provider: Provider | null): Signer {
    throw new Error('ImpersonatedSigner does not support connecting to a non-JsonRpcProvider provider')
  }
}
