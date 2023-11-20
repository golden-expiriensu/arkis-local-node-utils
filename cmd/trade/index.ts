import { Asset, Command } from '../../types'
import { increasePosition as curveIP, decreasePosition as curveDP } from './curvefi'

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
  let cmd: Command

  switch (protocol) {
    case 'curvefi':
      cmd = await curveIP({ account, pool, assets })
      break
    default:
      throw new Error(`unsupported protocol: ${protocol}`)
  }

  console.log(cmd.target)
  console.log(cmd.value)
  console.log(cmd.payload)
}

export async function decreasePosition(args: {
  account: string
  protocol: string
  pool: string
  percent: number
}): Promise<void> {
  const { account, protocol, pool, percent } = args
  let cmd: Command

  switch (protocol) {
    case 'curvefi':
      cmd = await curveDP({ account, pool, percent })
      break
    default:
      throw new Error(`unsupported protocol: ${protocol}`)
  }

  console.log(cmd.target)
  console.log(cmd.value)
  console.log(cmd.payload)
}
