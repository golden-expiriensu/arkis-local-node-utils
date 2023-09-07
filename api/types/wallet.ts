import { ExternallyOwnedAccount } from '@ethersproject/abstract-signer'
import { Signer } from 'ethers'

export type WalletLike = Signer & ExternallyOwnedAccount
