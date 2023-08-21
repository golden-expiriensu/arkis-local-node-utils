import axios from 'axios'
import { Contract } from 'ethers'
import Factory from 'src/artifacts/MarginAccountFactory.json'
import { WalletLike } from 'src/types'
import { getAddress } from './address'
import { HighBandwidthWallet } from './highBandwidthWallet'
import { getEndpoint } from './server'

export async function getFactory(): Promise<Contract> {
  return new Contract(await getFactoryAddress(), Factory.abi)
}

export async function getOwner(): Promise<WalletLike> {
  const key = process.env.OWNER_PRIVATE_KEY
  if (!key) throw new Error('OWNER_PRIVATE_KEY is not set in .env')
  return new HighBandwidthWallet({ privateKey: key }).sync()
}

export async function getFactoryAddress(): Promise<string> {
  const res = await axios.get(getEndpoint('address/marginAccount'))
  return getAddress(res.data)
}
