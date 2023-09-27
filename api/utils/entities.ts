import Factory from 'api/artifacts/MarginAccountFactory.json'
import { WalletLike } from 'api/types'
import axios from 'axios'
import { Contract } from 'ethers'
import { getAddress } from './address'
import { HighBandwidthWallet } from './highBandwidthWallet'
import { getEndpoint } from './server'

export async function getFactory(): Promise<Contract> {
  return new Contract(await getFactoryAddress(), Factory.abi)
}

export async function getOwner(): Promise<WalletLike> {
  return new HighBandwidthWallet({
    privateKey:
      process.env.MARGIN_ENGINE_PRIVATE_KEY ?? '0xd2b4a376e35f9a7719a237cc4ec4e644fd875017a978479e17c9833e16117651',
  }).sync()
}

export async function getFactoryAddress(): Promise<string> {
  const res = await axios.get(getEndpoint('address/marginAccount'))
  return getAddress(res.data)
}
