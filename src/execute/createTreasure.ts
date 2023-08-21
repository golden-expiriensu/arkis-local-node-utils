import { HighBandwidthWallet, Treasure } from 'src/utils'

require('tsconfig-paths/register')

export async function createTreasure(): Promise<Treasure> {
  return new Treasure(
    await new HighBandwidthWallet({
      mnemonic: {
        phrase: 'test test test test test test test test test test test junk',
        path: `m/44'/60'/0'/0/4`,
      },
    }).sync(),
  )
}
