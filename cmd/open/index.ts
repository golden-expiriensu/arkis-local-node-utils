import { Contract, Signer } from 'ethers'
import { getAbi, getDispatcher, getOwner, getProvider, getTreasure } from '../../config'
import { topUpEthBalance } from '../../wallet'
import { createAllocationPlan } from './createAllocationPlan'
import color from '@colors/colors'
import { depositToPool } from './depositToPool'

export async function open(account: string, treasure?: Signer): Promise<void> {
  const owner = getOwner()
  if (!treasure) treasure = getTreasure()
  const dispatcher = (await getDispatcher()).connect(owner) as Contract
  const acc = new Contract(account, getAbi('account'), getProvider())

  const promises = [
    topUpEthBalance({
      from: treasure,
      to: await owner.getAddress(),
      amount: 0n,
    }),
  ]
  promises.push(depositToPool(await acc.leverage(), treasure))
  await Promise.all(promises)

  console.log('Submitting the allocation plan...')
  const allocationPlan = await createAllocationPlan(account)
  const tx = await dispatcher.submitPlan(allocationPlan)
  const receipt = await tx.wait()

  console.log(`Submitted in transaction ${color.bgBlack(color.yellow(receipt.hash))}, verifying account state...`)
  const state = await acc.stateInfo()
  if (state[0] === 4n) {
    console.log('State is correct, account was opened successfully')
  } else {
    throw new Error(`unexpected account state, expected 4, got ${state[0]}`)
  }
}
