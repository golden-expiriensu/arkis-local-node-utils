import { Contract, constants } from 'ethers'
import { Scenario } from 'src/types'

type Arg = { scenario: Scenario; onlySuspend: boolean; factory: Contract }

export function createLiquidationPlan(arg: Arg): Object {
  return {
    action: {
      route: {
        protocol: '',
        destination: 'localhost',
      },
      content: createContent(arg),
    },
    onComplete: [],
  }
}

function createContent(arg: Arg): Object {
  const envelope: any = {
    sequence: [0],
    increasePositionInstructions: [],
    decreasePositionInstructions: [],
    exchangeInstructions: [],
    exchangeAllInstructions: [],
  }

  envelope.exchangeInstructions.push({
    protocol: 'transfer',
    request: {
      path: `${arg.scenario.leverage.token}000000000000000000000000000000000000000000000000`,
      amountIn: arg.onlySuspend ? constants.MaxUint256 : 1,
      extraData: '0x',
      minAmountOut: 0,
      recipient: arg.factory.address,
    },
  })

  return [envelope]
}
