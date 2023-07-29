import axios from 'axios'
import { Contract, utils } from 'ethers'
import { keccak256, concat, hexZeroPad, hexlify } from 'ethers/lib/utils'
import { getEndpoint } from './provider'

export function getAddress(address: string): string {
  return utils.getAddress(address.replace('0x000000000000000000000000', '0x'))
}

const DEFAULT_ERC20_BALANCES_SLOT = 0

const BALANCES_SLOT_EXCEPTIONS = Object.fromEntries([
  [getAddress('0xD533a949740bb3306d119CC777fa900bA034cd52'), 3],
  [getAddress('0x6b175474e89094c44da98b954eedeac495271d0f'), 2],
  [getAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'), 3],
  [getAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'), 9],
  [getAddress('0xdac17f958d2ee523a2206206994597c13d831ec7'), 2],
])

export async function setTokenBalance(token: Contract, acc: any, value: string): Promise<void> {
  const accAddress = typeof acc === 'string' ? acc : acc.address
  let slot = DEFAULT_ERC20_BALANCES_SLOT
  value = hexZeroPad(hexlify(value), 32)

  if (getAddress(token.address) in BALANCES_SLOT_EXCEPTIONS) slot = BALANCES_SLOT_EXCEPTIONS[getAddress(token.address)]

  const indexNew = keccak256(concat([hexZeroPad(hexlify(slot), 32), hexZeroPad(accAddress, 32)]))
  await axios.post(getEndpoint('setStorageAt'), {
    account: token.address,
    index: indexNew,
    value,
  })

  // Try to handle slots for contracts written in old solidity
  if ((await token.balanceOf(accAddress)).lt(value)) {
    const indexOld = keccak256(concat([hexZeroPad(accAddress, 32), hexZeroPad(hexlify(slot), 32)]))
    await axios.post(getEndpoint('setStorageAt'), {
      account: token.address,
      index: indexOld,
      value,
    })

    // If balance is not set as expected, then it means that token contract stores balances in an unusual slot,
    // in order to add it to exceptions list, check source contract, find "balances" mapping,
    // count it's position (starting from 0) and add it to BALANCES_SLOT_EXCEPTIONS
    if ((await token.balanceOf(accAddress)).lt(value))
      throw new Error(
        `Token ${token.address} seems to have an exceptional balances mapping slot, please add it to the exceptions list`,
      )
  }
}

export async function setBalance(acc: any, value: string): Promise<void> {
  const user = typeof acc === 'string' ? acc : acc.address
  value = hexZeroPad(hexlify(value), 32)

  await axios.post(getEndpoint('setBalance'), { user, value })
}
