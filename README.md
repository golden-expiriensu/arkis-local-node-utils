# Arkis CLI

## Prerequisites

Check if bun installed with `bun -v` or install it using the command below
```sh
curl -fsSL https://bun.sh/install | bash
```
Make sure you have `.env` file, if not copy content of `.env.example` and fill in url and keys.

## Commands

All token amounts in the following commands must be specified without decimals, for example 5 WETH and 1500 USDC, but not 5000000000000000000 WETH and 1500000000 USDC.

You can check all available commands by running `bun index.ts -h`. To check details of some specific command add the name of the command, for example `bun index.ts register -h` will show usage of account register subcommand.

### Register a new account
```sh
bun index.ts r 0x61d74003A35c7F0DE1EfaCbFc4d38f84d357F2E2 -l '5000 USDC' -c '3 WETH' '500 DAI'
```

### Open already registered account
```sh
bun index.ts o 0x94f4C1743d0a8d4F1b7792DD34Cf5A9F5ea97BCD
```

### Register and then open an account
```sh
bun index.ts r 0x61d74003A35c7F0DE1EfaCbFc4d38f84d357F2E2 -l '5000 USDC' -c '3 WETH' -o
```

# Coming soon...

### Increase position in CurveFi
```sh
bun index.ts trade 0x7e7BCCb71105EE2C712792D99BC76BD7c2FC6105 curvefi 3pool --add '5000 USDC' '1000 DAI' --mint
