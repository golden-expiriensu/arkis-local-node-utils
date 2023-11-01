import { Contract, ContractTransaction, Wallet, ethers } from 'ethers'
import { hexZeroPad, parseEther } from 'ethers/lib/utils'
import Factory from './src/artifacts/MarginAccountFactory.json'

require('dotenv').config()

const chainName = 'ethereum'

// const usage = '"bun" OR "pnpm ts-node" ./allocation.ts <factory address> <account address>'

// create factory
const factoryAddress = '0xEAbe98f78e18BC291f08C1aC357c638aCe620F35' // process.argv[2]
// if (!isAddress(factoryAddress)) {
//   console.log(`\x1b[31mInvalid address of margin account factory, expected a valid address\x1b[0m\nUsage: ${usage}`)
//   process.exit(1)
// }
const factory = new Contract(factoryAddress, Factory.abi)

// create account
const account = '0x8355a41154797d888ff832ed86710e04ff60664c' // process.argv[3]
// if (!isAddress(account)) {
//   console.log(`\x1b[31mInvalid address of margin account, expected a valid address\x1b[0m\nUsage: ${usage}`)
//   process.exit(1)
// }

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
const owner = new Wallet(
  process.env.MARGIN_ENGINE_PRIVATE_KEY ?? 'invalid private key of margin engine',
  getJsonProvider(),
)

async function main(): Promise<void> {
  console.log(`Factory address: ${factory.address}`)
  console.log(`Account address: ${account}`)
  console.log(`Owner address: ${owner.address}`)
  const tx: ContractTransaction = await factory.connect(owner).submitPlan(allocationPlan)
  console.log('awaiting tx hash: ', tx.hash)
  const receipt = await tx.wait()
  console.log('confirmed tx hash: ', receipt.transactionHash)
  console.log('block number: ', receipt.blockNumber)
}

export function getJsonProvider(): ethers.providers.JsonRpcProvider {
  return new ethers.providers.JsonRpcProvider(getProviderUrl())
}

export function getProviderUrl(): string {
  const url = process.env.LOCAL_NODE_URL
  if (!url) throw new Error('LOCAL_NODE_URL is not set in .env')
  return url
}

main()
