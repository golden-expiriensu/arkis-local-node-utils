# Arkis CLI

## Prerequisites

Check if bun installed with `bun -v` or install it using the command below
```sh
curl -fsSL https://bun.sh/install | bash
```

## Commands

All token amounts in the following commands must be specified without decimals, for example 5 WETH and 1500 USDC, but not 5000000000000000000 WETH and 1500000000 USDC.

### Register an account
You can specify leverage with `-l` or `--leverage` and collateral with `-c` or `--collateral`
```sh
bun register <owner> -l '<amount token>' -c '<amount_0 token_0 [, amount_1 token_1]'
```
Example
```sh
bun register 0x61d74003A35c7F0DE1EfaCbFc4d38f84d357F2E2 -l '5000 USDC' -c '3 WETH, 500 DAI'
```

### Open a registered account
```sh
bun open <account>
```

### Register and open an account
```sh
bun register <args> | bun open
```
Example
```sh
bun register 0x61d74003A35c7F0DE1EfaCbFc4d38f84d357F2E2 -l '5000 USDC' -c '3 WETH, 500 DAI' | bun open
```

# TODO

### Open a position in CurveFi
Example
```sh
bun trade 0x7e7BCCb71105EE2C712792D99BC76BD7c2FC6105 curvefi 3pool -d '5000 USDC, 1000 DAI' --mint
```

### Remove specific token amount from the account
```sh
bun rob <account> <token> <amount>
```

### Clear all tokens from the account
```sh
bun rob <account> completely
```
