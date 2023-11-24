import { AbiCoder, Contract, Wallet, getBytes, keccak256 } from 'ethers'
import { getAbi, getProvider } from '../../config'
import color from '@colors/colors'

export async function signCloseReq(args: {
  account: string
  privateKey: string
  recipient?: string
  untilBlock: number
}): Promise<string> {
  const owner = new Wallet(args.privateKey)
  const account = new Contract(args.account, getAbi('account'), getProvider())

  console.log('Checking if submitted private key is the owner of the account...')
  const actualOwner = await account.owner()
  if (actualOwner != owner.address) {
    throw new Error(
      `Owner of ${args.account} is ${actualOwner}, but submited private key corresponds to ${owner.address}`,
    )
  }

  const recipient = args.recipient ?? actualOwner
  console.log(`All assets will be transfered to ${recipient} after closing`)

  const encoded = AbiCoder.defaultAbiCoder().encode(
    ['address account', 'address recipient', 'uint256 untilBlock'],
    [args.account, recipient, args.untilBlock],
  )

  const hashed: Uint8Array = getBytes(keccak256(encoded))
  const signature: string = await owner.signMessage(hashed)
  console.log(`Cooked the signature: ${color.bgBlack(color.green(signature))}`)

  return signature
}
