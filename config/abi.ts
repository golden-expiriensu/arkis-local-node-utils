import IERC20 from "./abi/IERC20.json"
import Dispatcher from "./abi/Dispatcher.json"
import Account from "./abi/Account.json"

export function getAbi(type: 'erc20' | 'dispatcher' | 'account') {
  switch (type) {
    case 'erc20':
      return IERC20
    case 'dispatcher':
      return Dispatcher
    case 'account':
      return Account
  }
}
