import { BigNumber, Contract, constants } from 'ethers'
import ERC20 from 'src/artifacts/IERC20.json'
import { Asset, MaybeTx, Scenario, WalletLike } from 'src/types'
import { Treasure, isETH } from 'src/utils'

export async function topUpBalancesAndMakeApprovals(
  treasure: Treasure,
  scenario: Scenario,
  approveTo: { address: string },
): Promise<BigNumber> {
  const assets = scenario.collateral
  const account = scenario.owner.wallet
  const ethValue = findTotalEth(assets)

  const promises = new Array<Promise<MaybeTx>>()

  for (const asset of assets) {
    if (isETH(asset.token)) {
      promises.push(treasure.topUpEthBalance(account.address, asset.amount))
    } else {
      promises.push(
        topUpTokenBalanceAndApprove({
          treasure,
          account,
          token: asset.token,
          amount: asset.amount,
          approveTo: approveTo.address,
        }),
      )
    }
  }
  if (ethValue.eq(0)) promises.push(treasure.topUpEthBalance(account.address, 0))

  const txs = await Promise.all(promises)
  await Promise.all(txs.map((tx) => tx?.wait()))

  return ethValue
}

function findTotalEth(assets: Asset[]) {
  const addAssetAmountIfEth = (totalEth: BigNumber, asset: Asset) => {
    return isETH(asset.token) ? totalEth.add(asset.amount) : totalEth
  }
  return assets.reduce(addAssetAmountIfEth, constants.Zero)
}

async function topUpTokenBalanceAndApprove(arg: {
  treasure: Treasure
  account: WalletLike
  token: string
  amount: string
  approveTo: string
}): Promise<MaybeTx> {
  const token = new Contract(arg.token, ERC20, arg.account)

  const tx = await arg.treasure.topUpTokenBalance(token, arg.account.address, arg.amount)

  const allowance: BigNumber = await token.allowance(arg.account.address, arg.approveTo)
  if (allowance.lt(arg.amount)) {
    return await token.connect(arg.account).approve(arg.approveTo, constants.MaxUint256)
  }

  return tx
}
