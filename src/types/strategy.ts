import { Wallet } from 'ethers'
import { Asset } from './asset'

export type RawScenario = {
  owner: string
  collateral: Array<Asset>
  leverage: Asset
}

export type Scenario = {
  owner: {
    name: string
    wallet: Wallet
  }
  collateral: Array<Asset>
  leverage: Asset
}

export type Strategy<ScenarioType> = {
  [key in 'register' | 'open' | 'suspend' | 'close']: Array<ScenarioType>
}
