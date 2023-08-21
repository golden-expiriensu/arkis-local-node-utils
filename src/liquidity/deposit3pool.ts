import { createTreasure } from 'src/execute/createTreasure'
import { addLiquidity3pool } from './addLiquidity3pool'

async function main() {
  const address = process.argv[2]
  const ownerPrivateKey = process.argv[3]

  const treasure = await createTreasure()

  await addLiquidity3pool(treasure, address, ownerPrivateKey, {
    dai: '1000000000000000000000',
    usdc: '1000000000',
    usdt: '1000000000',
  })
}

main()
