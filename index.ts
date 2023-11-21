import { Command, Option } from 'commander'
import { register, open, increasePosition, decreasePosition } from './cmd'
import { parseAsset } from './parser'
import { getAddress } from 'ethers'

const program = new Command()
program.name('account').description('Arkis CLI tools for managing margin accounts').version('1.1.0')

program
  .command('register')
  .alias('r')
  .description('Register an account for the specified owner')
  .argument('<owner>', 'Address which will be the owner of the account')
  .requiredOption('-l, --leverage <asset>', 'Leverage for registration')
  .requiredOption('-c, --collateral <assets...>', 'Collateral for registration')
  .option('-o, --open', 'Open the account after registration')
  .action(async (owner: string, options: any) => {
    try {
      const collateral = options.collateral.map(parseAsset)
      const leverage = parseAsset(options.leverage)
      const { account, treasure } = await register(getAddress(owner), collateral, leverage)
      if (options.open) await open(account, treasure)
    } catch (err) {
      program.error(`error: ${err.message}`)
    }
  })

program
  .command('open')
  .alias('o')
  .description('Open already registered account by allocating the leverage')
  .argument('<account>', 'Address of registered account to be opened')
  .action(async (account: string) => {
    try {
      await open(getAddress(account))
    } catch (err) {
      program.error(`error: ${err.message}`)
    }
  })

program
  .command('trade')
  .alias('t')
  .description('Perform a trade operation on the margin account')
  .argument('<account>', 'Address of the margin account')
  .argument('<protocol>', 'Protocol in which trade will be performed')
  .argument('<pool>', 'Liquidity pool in which trade will be performed')
  .addOption(
    new Option('-ip, --increase-position [assets...]', 'Assets to deposit into the liquidity pool').conflicts(
      'decreasePosition',
    ),
  )
  .addOption(
    new Option('-dp, --decrease-position [percent]', 'Percent on which position must be decreased').conflicts(
      'increasePosition',
    ),
  )
  .action(async (account: string, protocol: string, pool: string, options: any) => {
    try {
      if (options.increasePosition) {
        let assets = options.increasePosition

        if (typeof assets === 'boolean') {
          assets = []
        }

        await increasePosition({
          account: getAddress(account),
          protocol,
          pool,
          assets: assets.map(parseAsset),
        })
      } else if (options.decreasePosition) {
        let percent = options.decreasePosition

        if (typeof percent === 'boolean') {
          percent = 100
        }
        if (isNaN(parseInt(percent))) {
          program.error(`error: invalid percent value "${percent}", expected an integer`)
        }
        if (percent < 0 || percent > 100) {
          program.error(`error: invalid percent value "${percent}", expected an integer between 0 and 100`)
        }

        await decreasePosition({
          account: getAddress(account),
          protocol,
          pool,
          percent: parseInt(percent),
        })
      } else {
        program.error("error: required option '--increase-position' OR '--decrease-position' not specified")
      }
    } catch (err) {
      program.error(`error: ${err.message}`)
    }
  })

program.parse(process.argv)
