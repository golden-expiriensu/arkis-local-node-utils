import { utils } from 'ethers'

export function getAddress(address: string): string {
  return utils.getAddress(address.replace('0x000000000000000000000000', '0x'))
}

export function isETH(token: string): boolean {
  return token.toLowerCase() === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
}
