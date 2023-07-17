## Prerequisites

1. Set all required variables as described in .env.example in .env file
2. Install all required packages
   ```bash
   pnpm i
   ```

Account owner, collateral and leverage configurable in "src/account.json" file

## Fetch events

- AccountBorrowed
  ```bash
  pnpm fetch:ab
  ```

## Register

Register new account

```bash
pnpm register
```
