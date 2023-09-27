import { HighBandwidthWallet, Treasure } from 'src/utils'

export async function createTreasure(): Promise<Treasure> {
  return new Treasure(
    await new HighBandwidthWallet({
      privateKey:
        process.env.TREASURE_PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    }).sync(),
  )
}
