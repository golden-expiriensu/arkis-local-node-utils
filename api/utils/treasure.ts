import { BigNumber, Contract } from 'ethers'

import { MaybeTx, WalletLike } from 'api/types'
import { getProvider } from 'api/utils'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'

export class Treasure {
  constructor(private wallet: WalletLike) {}

  async topUpTokenBalance(token: Contract, account: string, upToAmount: string | BigNumber): Promise<MaybeTx> {
    const decimals = Number(await token.decimals())
    console.log(
      `Treasure: topping up ${await token.symbol()} balance up to amount ${formatUnits(upToAmount, decimals)}`,
    )

    const target = BigNumber.from(upToAmount)
    const currentBalance = await token.balanceOf(account)
    if (currentBalance.gt(target)) return undefined

    return token.connect(this.wallet).transfer(account, target.sub(currentBalance))
  }

  async topUpEthBalance(account: string, upToAmount: number | string | BigNumber, includeGas = true): Promise<MaybeTx> {
    console.log(
      `Treasure: topping up ETH balance up to amount ${formatEther(upToAmount)}${includeGas ? ' + gas expenses' : ''}`,
    )

    let target = BigNumber.from(upToAmount)
    if (includeGas) target = target.add(parseEther('1'))

    const currentBalance = await getProvider().getBalance(account)
    if (currentBalance.gt(target)) return undefined

    return this.wallet.sendTransaction({
      to: account,
      value: target.sub(currentBalance),
    })
  }
}
