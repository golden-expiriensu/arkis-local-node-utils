import ERC20 from 'api/artifacts/IERC20.json'
import { Asset, MaybeTx, Scenario, WalletLike } from 'api/types'
import { Treasure, isETH } from 'api/utils'
import { BigNumber, Contract, constants } from 'ethers'

export async function topUpBalancesAndMakeApprovals(
  treasure: Treasure,
  scenario: Scenario,
  approveTo: { address: string },
): Promise<BigNumber> {
  const assets = scenario.collateral
  const account = scenario.owner.wallet
  const ethValue = findTotalEth(assets)

  const promises = new Array<Promise<MaybeTx>>()
  // We do gas top up first to be able to make the approvals later
  promises.push(treasure.topUpEthBalance(account.address, 0))

  for (const asset of assets) {
    if (isETH(asset.token)) {
      promises.push(treasure.topUpEthBalance(account.address, asset.amount, false))
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

  const txs = await Promise.all(promises)
  await Promise.all(txs.filter((tx) => typeof tx !== 'undefined').map((tx) => tx?.wait()))

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
