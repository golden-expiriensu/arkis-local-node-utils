import { Contract } from 'ethers'
import { Asset, Command } from '../../types'
import { increasePosition as curveIP, decreasePosition as curveDP } from './curvefi'
import { getAbi, getProvider, getTreasure } from '../../config'
import { ImpersonatedSigner, topUpEthBalance } from '../../wallet'
import color from '@colors/colors'

export async function increasePosition(args: {
  account: string
  protocol: string
  pool: string
  assets: Asset[]
}): Promise<void> {
  const { account, protocol, pool, assets } = args
  let cmd: Command

  switch (protocol) {
    case 'curvefi':
      cmd = await curveIP({ account, pool, assets })
      break
    default:
      throw new Error(`unsupported protocol: ${protocol}`)
  }

  const acc = await getAccountFromOwner(account)
  const tx = await acc.execute(cmd)
  await tx.wait()
  console.log(`Successfully increased position in transaction ${color.bgBlack(color.yellow(tx.hash))}`)
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

  const acc = await getAccountFromOwner(account)
  const tx = await acc.execute(cmd)
  await tx.wait()
  console.log(`Successfully decreased position in transaction ${color.bgBlack(color.yellow(tx.hash))}`)
}

async function getAccountFromOwner(account: string): Promise<Contract> {
  const acc = new Contract(account, getAbi('account'), getProvider())
  const owner = await acc.owner()
  await topUpEthBalance({
    from: getTreasure(),
    to: owner,
    amount: 0n,
  })
  return acc.connect(await new ImpersonatedSigner(owner, getProvider()).sync()) as Contract
}
