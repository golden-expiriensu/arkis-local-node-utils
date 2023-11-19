import { Command } from 'commander'
import { register, open } from './cmd'
import { parseAsset } from './parser'
import { getAddress } from 'ethers'

const program = new Command()
program.name('account').description('Arkis internal CLI tools for quality assessment').version('1.0.0')

program
  .command('register')
  .alias('r')
  .description('Register an account for the specified owner')
  .argument('<owner>', 'Address which will be the owner of the account')
  .requiredOption('-l, --leverage <asset>', 'Leverage for registration')
  .requiredOption('-c, --collateral [assets...]', 'Collateral for registration')
  .option('-o, --open', 'Open the account after registration')
  .action(async (owner: string, options: any) => {
    const collateral = options.collateral.map(parseAsset)
    const leverage = parseAsset(options.leverage)
    const { account, treasure } = await register(getAddress(owner), collateral, leverage)
    if (options.open) open(account, treasure)
  })

program
  .command('open')
  .alias('o')
  .description('Open already registered account by allocating the leverage')
  .argument('<account>', 'Address of registered account to be opened')
  .action((account: string) => open(getAddress(account)))

program.parse(process.argv)
