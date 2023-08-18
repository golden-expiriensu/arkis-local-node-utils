export type Asset = {
  token: string
  amount: string
}

export type AccountConfig = {
  ownerPrivateKey: string
  collateral: Array<Asset>
  leverage: Asset
}
