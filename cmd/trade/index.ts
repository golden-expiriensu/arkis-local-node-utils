import { Asset } from '../../types'

export async function increasePosition(args: {
  account: string
  protocol: string
  pool: string
  assets: Asset[]
}): Promise<void> {
  const { account, protocol, pool, assets } = args
  if (assets.length === 0) {
    throw new Error('increase position on all balance is not supported yet')
  }
  console.log(`increase position ${account} ${JSON.stringify(assets)}`)
}

export async function decreasePosition(args: {
  account: string
  protocol: string
  pool: string
  percent: Asset[]
}): Promise<void> {
  const { account, protocol, pool, percent } = args
  console.log(`decrease position ${account} ${percent}`)
}
