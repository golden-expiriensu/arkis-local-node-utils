import { Asset } from './asset'
import { WalletLike } from './wallet'

export type RawScenario = {
  owner: string
  collateral: Array<Asset>
  leverage: Asset
}

export type Scenario = {
  owner: {
    name: string
    wallet: WalletLike
  }
  collateral: Array<Asset>
  leverage: Asset
}

export type Strategy<ScenarioType> = {
  [key in 'register' | 'open' | 'suspend' | 'close']: Array<ScenarioType>
}
