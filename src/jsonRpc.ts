const jsonrpc = '2.0'

type JsonRpcMethod = 'eth_getLogs'

export function wrapJsonRpcBody(method: JsonRpcMethod, param: Object): Object {
  return {
    jsonrpc,
    method,
    params: [param],
    id: 0,
  }
}
