import IERC20 from "./abi/IERC20.json"
import Dispatcher from "./abi/Dispatcher.json"

export function getAbi(type: 'erc20' | 'dispatcher') {
  switch (type) {
    case 'erc20':
      return IERC20
    case 'dispatcher':
      return Dispatcher
  }
}
