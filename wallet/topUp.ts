import { Contract, MaxUint256, Signer, parseEther } from "ethers";
import { getProvider } from "../config";

const gasSpending = parseEther('1')

export async function topUpEthBalance(args: {
  from: Signer,
  to: string,
  amount: bigint
}): Promise<void> {
  const { from, to, amount } = args
  const current = await getProvider().getBalance(to)
  const target = amount + gasSpending

  if (target > current) {
    console.log(`Topping up ETH balance of ${to} up to amount ${args.amount} + gas spendings (${gasSpending})`)
    const tx = await from.sendTransaction({
      to,
      value: target - current
    })
    await tx.wait()
  } else {
    console.log(`Account ${to} has enough ETH balance`)
  }
}

export async function topUpBalance(args: {
  token: Contract,
  from: Signer,
  to: string,
  amount: bigint
}): Promise<void> {
  const { token, from, to, amount } = args
  if (await isEth(token)) {
    return topUpEthBalance(args)
  }
  const current = await token.balanceOf(to)

  if (amount > current) {
    console.log(`Topping up ${await token.symbol()} balance of ${to} up to amount ${args.amount}`)
    const tx = await (token.connect(from) as Contract).transfer(to, amount - current)
    await tx.wait()
  } else {
    console.log(`Account ${to} has enough ${await token.symbol()} balance`)
  }
}

export async function maxApprove(args: {
  token: Contract,
  from: Signer,
  to: string,
}): Promise<void> {
  const { token, from, to } = args
  const allowance = await token.allowance(await from.getAddress(), to)

  if (allowance == 0n) {
    console.log(`Setting infinite approval on token ${await token.symbol()}`)
    const tx = await (token.connect(from) as Contract).approve(to, MaxUint256)
    await tx.wait()
  } else {
    console.log(`Approval of ${await token.symbol()} is already greater than zero`)
  }
}

async function isEth(token: Contract): Promise<boolean> {
  const address = await token.getAddress()
  return address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
}
