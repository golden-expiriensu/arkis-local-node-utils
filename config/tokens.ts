export function getToken(symbol: string): {
  address: string
  decimals: number
} {
  if (symbol in TOKENS) {
    return TOKENS[symbol]
  }
  throw new Error(`unsupported token: "${symbol}"`)
}

export function isEth(token: { address: string }): boolean {
  return token.address === TOKENS['ETH'].address
}

const TOKENS = {
  ETH: {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
  },
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
  },
  wstETH: {
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    decimals: 18,
  },
  stETH: {
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    decimals: 18,
  },
  WBTC: {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
  },
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
  },
  FRAX: {
    address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    decimals: 18,
  },
  CRV: {
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    decimals: 18,
  },
  cvxCRV: {
    address: '0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7',
    decimals: 18,
  },
  FXS: {
    address: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
    decimals: 18,
  },
  LDO: {
    address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    decimals: 18,
  },
  MATIC: {
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    decimals: 18,
  },
  '3Crv': {
    address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    decimals: 18,
  },
  crv3crypto: {
    address: '0xc4AD29ba4B3c580e6D59105FFf484999997675Ff',
    decimals: 18,
  },
  crvFRAX: {
    address: '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
    decimals: 18,
  },
  steCRV: {
    address: '0x06325440D014e39736583c165C2963BA99fAf14E',
    decimals: 18,
  },
} as const
