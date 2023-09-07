import ERC20 from 'api/artifacts/IERC20.json'
import { MaybeTx, Scenario } from 'api/types'
import { Treasure, isETH } from 'api/utils'
import { Contract } from 'ethers'

export function mintLeverage(arg: { scenario: Scenario; treasure: Treasure; mintTo: Contract }): Promise<MaybeTx> {
  const leverage = arg.scenario.leverage
  const mintTo = arg.mintTo.address

  if (isETH(leverage.token)) {
    return arg.treasure.topUpEthBalance(mintTo, leverage.amount)
  }

  const token = new Contract(leverage.token, ERC20, arg.mintTo.provider)

  return arg.treasure.topUpTokenBalance(token, mintTo, leverage.amount)
}
