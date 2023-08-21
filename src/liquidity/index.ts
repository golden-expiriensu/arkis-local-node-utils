require('tsconfig-paths/register')

import { Contract, Wallet } from 'ethers'
import { isAddress, solidityKeccak256 } from 'ethers/lib/utils'
import MarginAccountImplementation from 'src/artifacts/MarginAccountImplementation.json'
import { createTreasure } from 'src/execute/createTreasure'
import { getProvider } from 'src/utils'
import { addLiquidity3pool } from './addLiquidity3pool'

async function main() {
  const address = process.argv[2]
  if (!address) throw new Error('Must specify margin account address')
  if (!isAddress(address)) throw new Error('Margin account address must be a valid ethereum address')

  const account = new Contract(address, MarginAccountImplementation.abi, getProvider())

  const name = process.argv[3]
  if (!name) throw new Error('Must specify name of the owner of margin account')

  const trader = new Wallet(solidityKeccak256(['string'], [name]), getProvider())
  const expectOwnerAddress = await account.owner()

  if (trader.address.toLowerCase() !== expectOwnerAddress.toLowerCase())
    throw new Error(`
  Account with name "${name}" has address ${trader.address} that does not match address 
of the owner (${expectOwnerAddress}) of the specified margin account with address 
${account.address}. Specify correct name of the owner (case sensitive). Beware that "Alice" != "alice"
  `)

  const treasure = await createTreasure()

  await addLiquidity3pool(treasure, account, trader, {
    dai: '1000000000000000000000',
    usdc: '1000000000',
    usdt: '1000000000',
  })
}

main()
