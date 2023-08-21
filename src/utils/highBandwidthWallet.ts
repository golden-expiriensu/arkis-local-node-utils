import { Provider, TransactionRequest } from '@ethersproject/abstract-provider'
import {
  ExternallyOwnedAccount,
  Signer,
  TypedDataDomain,
  TypedDataField,
  TypedDataSigner,
} from '@ethersproject/abstract-signer'
import { Bytes, Wallet } from 'ethers'
import { getProvider } from './provider'

export class HighBandwidthWallet extends Signer implements ExternallyOwnedAccount, TypedDataSigner {
  readonly provider = getProvider()

  private readonly wallet: Wallet
  private nonce?: number | undefined

  constructor(source: {
    wallet?: Wallet
    privateKey?: string
    mnemonic?: {
      phrase: string
      path?: string
    }
  }) {
    super()

    if (source.wallet) {
      this.wallet = source.wallet
    } else if (source.privateKey) {
      this.wallet = new Wallet(source.privateKey)
    } else if (source.mnemonic) {
      this.wallet = Wallet.fromMnemonic(source.mnemonic.phrase, source.mnemonic.path)
    } else {
      const msg = 'Source is not provided. Specify either wallet, privateKey, or mnemonic'
      throw new Error(msg)
    }

    this.wallet = this.wallet.connect(getProvider())
  }

  async sync(): Promise<HighBandwidthWallet> {
    this.nonce = await this.wallet.getTransactionCount()
    return this
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    if (typeof this.nonce === 'undefined') throw new Error('Wallet is not synced')

    transaction.nonce = this.nonce++
    return this.wallet.signTransaction(transaction)
  }

  getAddress(): Promise<string> {
    return this.wallet.getAddress()
  }

  signMessage(message: string | Bytes): Promise<string> {
    return this.wallet.signMessage(message)
  }

  connect(provider: Provider): Signer {
    return new HighBandwidthWallet({ wallet: this.wallet.connect(provider) })
  }

  get address(): string {
    return this.wallet.address
  }
  get privateKey(): string {
    return this.wallet.privateKey
  }

  _signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
  ): Promise<string> {
    return this.wallet._signTypedData(domain, types, value)
  }
}
