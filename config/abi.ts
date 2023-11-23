import IERC20 from './abi/IERC20.json'
import Dispatcher from './abi/Dispatcher.json'
import PoolRegistry from './abi/PoolRegistry.json'
import Pool from './abi/Pool.json'
import Account from './abi/Account.json'
import CurveFiPool from './abi/CurveFiPool.json'

export function getAbi(type: 'erc20' | 'dispatcher' | 'pool_registry' | 'pool' | 'account' | 'curvefi_pool') {
  switch (type) {
    case 'erc20':
      return IERC20
    case 'dispatcher':
      return Dispatcher
    case 'pool_registry':
      return PoolRegistry
    case 'pool':
      return Pool
    case 'account':
      return Account
    case 'curvefi_pool':
      return CurveFiPool
  }
}
