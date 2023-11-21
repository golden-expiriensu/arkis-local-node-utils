# Arkis CLI

## Prerequisites

Check if bun installed with `bun -v` or install it using the command below
```sh
curl -fsSL https://bun.sh/install | bash
```
Make sure you have `.env` file, if not copy content of `.env.example` and fill in url and keys. If you have already an env file make sure it is up to date with an example one.

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

### Increase position in CurveFi
Using specific tokens with specific amounts:
```sh
bun index.ts t 0x7e7BCCb71105EE2C712792D99BC76BD7c2FC6105 curvefi 3pool -ip '5000 USDC' '1000 DAI'
```
or using all available tokens to deposit:
```sh
bun index.ts t 0x7e7BCCb71105EE2C712792D99BC76BD7c2FC6105 curvefi 3pool -ip
```
Pools available for trading:
 - 3pool
 - tricrypto
 - frax_usdc
 - steth

### Decrease position in CurveFi
Decrease position by 75%
```sh
bun index.ts trade 0x7e7BCCb71105EE2C712792D99BC76BD7c2FC6105 curvefi tricrypto -dp 75
```
or make a withdraw on whole position:
```sh
bun index.ts trade 0x7e7BCCb71105EE2C712792D99BC76BD7c2FC6105 curvefi tricrypto -dp
```

# Coming soon...

### Remove specific token amount from the account
```sh
bun index.ts delete --token '200 USDC' --from 0x7e7BCCb71105EE2C712792D99BC76BD7c2FC6105
```

### Clear all tokens from the account
```sh
bun index.ts delete --all --from 0x7e7BCCb71105EE2C712792D99BC76BD7c2FC6105
```
