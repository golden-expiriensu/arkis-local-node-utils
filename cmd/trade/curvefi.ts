import { Contract, Interface, parseUnits } from 'ethers'
import { getAbi, getProvider, getToken } from '../../config'
import { Asset, Command } from '../../types'

export async function increasePosition(args: { account: string; pool: string; assets: Asset[] }): Promise<Command> {
  const { account, assets } = args
  if (assets.length === 0) {
    throw new Error('increase position on all balance is not supported yet')
  }
  const pool = getPool(args.pool)
  for (const asset of assets) {
    if (!pool.tokens.some((t) => t.address === asset.token)) {
      throw new Error(`token "${asset.symbol}" is not found in "${args.pool}" pool`)
    }
  }
  const abi = new Interface(getAbi('curvefi_pool'))

  return {
    target: pool.address,
    value: 0n,
    payload: abi.encodeFunctionData(`add_liquidity(uint256[${pool.tokens.length}],uint256)`, [
      pool.tokens.map((t) =>
        parseUnits(assets.find((a) => a.token === t.address)?.amount.toString() ?? '0', t.decimals),
      ),
      0,
    ]),
  }
}

export async function decreasePosition(args: { account: string; pool: string; percent: number }): Promise<Command> {
  const { account } = args
  const percent = BigInt(args.percent)
  const pool = getPool(args.pool)
  const abi = new Interface(getAbi('curvefi_pool'))
  const lpt = new Contract(getToken(pool.lpt).address, getAbi('erc20'), getProvider())

  return {
    target: pool.address,
    value: 0n,
    payload: abi.encodeFunctionData(`remove_liquidity(uint256,uint256[${pool.tokens.length}])`, [
      ((await lpt.balanceOf(account)) * percent) / 100n,
      new Array(pool.tokens.length).fill(0),
    ]),
  }
}

function getPool(name: string): {
  address: string
  lpt: string
  tokens: {
    address: string
    decimals: number
  }[]
} {
  console.log(`get pool ${name}`)
  if (name in POOLS) {
    return POOLS[name]
  } else {
    throw new Error(`unsupported pool: "${name}"`)
  }
}

const POOLS = {
  '3pool': {
    address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
    lpt: '3Crv',
    tokens: [getToken('DAI'), getToken('USDC'), getToken('USDT')],
  },
  frax: {
    address: '0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2',
    lpt: 'crvFRAX',
    tokens: [getToken('FRAX'), getToken('USDC')],
  },
  steth: {
    address: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    lpt: 'steCRV',
    tokens: [getToken('ETH'), getToken('stETH')],
  },
  tricrypto: {
    address: '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46',
    lpt: 'crv3crypto',
    tokens: [getToken('USDT'), getToken('WBTC'), getToken('WETH')],
  },
} as const
