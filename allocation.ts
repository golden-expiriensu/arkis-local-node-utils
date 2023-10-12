import { Contract, ContractTransaction, Wallet } from 'ethers'
import { hexZeroPad, isAddress, parseEther } from 'ethers/lib/utils'
import Factory from './src/artifacts/MarginAccountFactory.json'

const chainName = 'localhost'

const usage = '"bun" OR "pnpm ts-node" ./allocation.ts <factory address> <account address>'

// create factory
const factoryAddress = process.argv[2]
if (!isAddress(factoryAddress)) {
  console.log(`\x1b[31mInvalid address of margin account factory, expected a valid address\x1b[0m\nUsage: ${usage}`)
  process.exit(1)
}
const factory = new Contract(factoryAddress, Factory.abi)

// create account
const account = process.argv[3]
if (!isAddress(account)) {
  console.log(`\x1b[31mInvalid address of margin account, expected a valid address\x1b[0m\nUsage: ${usage}`)
  process.exit(1)
}

// allocation plan
const leverageToken = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const leverageAmount = parseEther('0.65')

const allocationPlan = [
  {
    action: {
      route: {
        protocol: '',
        destination: chainName,
      },
      content: [
        {
          sequence: [1, 0],
          increasePositionInstructions: [
            {
              protocol: 'arkis.marginaccount',
              request: {
                descriptor: {
                  poolId: 0,
                  extraData: hexZeroPad(account, 32),
                },
                input: [
                  {
                    token: leverageToken,
                    amount: leverageAmount,
                  },
                ],
                minLiquidityOut: 0,
              },
            },
          ],
          decreasePositionInstructions: [
            {
              protocol: 'arkis.liquiditypool',
              request: {
                descriptor: {
                  poolId: 0,
                  extraData: '0x',
                },
                liquidity: leverageAmount,
                minOutput: [
                  {
                    token: leverageToken,
                    amount: leverageAmount,
                  },
                ],
              },
            },
          ],
          exchangeInstructions: [],
          exchangeAllInstructions: [],
        },
      ],
    },
    onComplete: [],
  },
]

// create owner
const owner = new Wallet(process.env.MARGIN_ENGINE_PRIVATE_KEY ?? 'invalid private key of margin engine')

async function main(): Promise<void> {
  const tx: ContractTransaction = await factory.connect(owner).submitPlan(allocationPlan)
  console.log('awaiting tx hash: ', tx.hash)
  const receipt = await tx.wait()
  console.log('confirmed tx hash: ', receipt.transactionHash)
  console.log('block number: ', receipt.blockNumber)
}

main()
