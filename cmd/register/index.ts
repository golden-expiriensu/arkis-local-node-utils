import { Contract, TransactionReceipt, getAddress } from "ethers";
import { getDispatcher, getProvider, getTreasure } from "../../config";
import { Asset } from "../../types";
import { ImpersonatedSigner, maxApprove, topUpBalance, topUpEthBalance } from "../../wallet";
import { signRiskFactor } from "./signRiskFactor";
import color from '@colors/colors'

const REGISTER_TOPIC = '0x25e16b23f4151af78a7aa799ac8ab9be8de857409238a98d68cf98a4f19e020d'

export async function register(owner: string, collateral: Asset[], leverage: Asset): Promise<string> {
  const treasure = getTreasure()
  const signer = await new ImpersonatedSigner(owner, getProvider()).sync()
  const dispatcher = (await getDispatcher()).connect(signer) as Contract

  await topUpEthBalance({
    from: treasure,
    to: owner,
    amount: 0n
  })

  const promises = new Array<Promise<void>>()
  for (const { abi: token, amount } of collateral) {
    promises.push(topUpBalance({
      token,
      from: treasure,
      to: owner,
      amount
    }))
    promises.push(maxApprove({
      token,
      from: signer,
      to: await dispatcher.getAddress()
    }))
  }
  await Promise.all(promises)

  console.log('All balances and approvals are set, registering the account...')
  const metadata = await signRiskFactor(collateral, leverage)
  const value = [...collateral, leverage].find(a => isEth(a.token))?.amount ?? 0n

  const tx = await dispatcher.registerMarginAccount(
    metadata.collateral,
    metadata.leverage,
    metadata.riskFactor,
    metadata.timestamp,
    metadata.nonce,
    metadata.signature,
    { value }
  )
  const receipt: TransactionReceipt = await tx.wait()
  const event = receipt.logs.find(log => log.topics[0] === REGISTER_TOPIC)
  if (!event) {
    throw new Error('Margin account registration failed: event was not emitted')
  }

  const account = getAddress(event.topics[1].slice(26))
  console.log(`Margin account ${color.bgBlack(color.green(account))} registered in transaction ${color.bgBlack(color.yellow(receipt.hash))}`)
  return account
}

function isEth(token: string): boolean {
  return token.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
}
