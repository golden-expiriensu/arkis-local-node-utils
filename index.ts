import { Command } from 'commander'
import { register, open } from './cmd'
import { parseAsset } from './parser'

const program = new Command()
program.name('account').description('Arkis internal CLI tools for quality assessment').version('1.0.0')

program.command('register')
  .alias('r')
  .description('Register an account for the specified owner')
  .argument('<owner>', 'Address which will be the owner of the account')
  .requiredOption('-l, --leverage <asset>', 'Leverage for registration')
  .requiredOption('-c, --collateral [assets...]', 'Collateral for registration')
  .action((owner: string, options: any) => {
    register(owner, parseAsset(options.leverage), options.collateral.map(parseAsset))
  })

program.command('open')
  .alias('o')
  .description('Open already registered account by allocating the leverage')
  .argument('<account>', 'Address of registered account to be opened')
  .action((account: string) => open(account))

program.parse(process.argv)
