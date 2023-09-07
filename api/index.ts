require('tsconfig-paths').register()
import { BigNumber } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import express from 'express'
import { createTreasure } from './createTreasure'
import { openMarginAccount as open } from './open'
import { registerMarginAccount as register } from './register'
import { Asset, Scenario } from './types'
import { getFactory, getJsonProvider, getOwner } from './utils'
import { ImpersonatedSigner } from './utils/impersonatedSigner'

const app = express()

app.use(express.json())

app.get('/ping', (_, res) => {
  res.send('pong')
})

app.post('/open/:trader', async (req, res) => {
  req.setTimeout(180_000, function () {
    res.status(408).send('Request Timeout')
  })

  const owner = await getOwner()
  const factory = (await getFactory()).connect(owner)
  const treasure = await createTreasure()
  await treasure.topUpEthBalance(owner.address, 0)

  const trader = req.params.trader
  if (!isAddress(trader)) return res.status(400).send('Invalid trader address')

  const impersonatedTrader = new ImpersonatedSigner(trader, getJsonProvider())
  const collateral = getAndValidateCollateral(req.body)
  const leverage = getAndValidateLeverage(req.body)

  const scenario: Scenario = {
    owner: {
      name: trader,
      wallet: impersonatedTrader,
    },
    collateral,
    leverage,
  }

  try {
    const registered = await register(treasure, scenario, factory)
    await open(treasure, scenario, factory, registered)
    res.send(registered)
  } catch (err) {
    res.status(400).send(err)
  }
})

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000')
})

function getAndValidateCollateral(body: any): Array<Asset> {
  if (!Array.isArray(body.collateral)) throw new Error('Collateral must be an array')

  const collateral = new Array<Asset>()
  for (const asset of body.collateral) {
    collateral.push(parseAsset(asset))
  }

  return collateral
}

function getAndValidateLeverage(body: any): Asset {
  return parseAsset(body.leverage)
}

function parseAsset(asset: any): Asset {
  if (!isAddress(asset.token)) throw new Error('Invalid token address:', asset.token)
  return {
    token: asset.token,
    amount: BigNumber.from(asset.amount).toHexString(),
  }
}
