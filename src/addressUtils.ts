export function getAddress(address: string): string {
  return address.replace('0x000000000000000000000000', '0x')
}
