import { getConnectedProvider } from 'decentraland-dapps/dist/lib/eth'
import { ethers } from 'ethers'
import { namehash } from 'ethers/lib/utils'
import { Provider } from '@ethersproject/providers'
import { ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'

function getResolverContract(contractAddress: string, provider: Provider) {
  return new ethers.Contract(
    contractAddress,
    ['function addr(bytes32 node) public view virtual override returns (address payable)'],
    provider
  )
}

export async function resolveName(name: string) {
  const nodehash = namehash(name)
  const connectedProvider = await getConnectedProvider()
  if (!connectedProvider) {
    console.error('NO PROVIDER')
    return undefined
  }

  const resolverContract = getResolverContract(ENS_RESOLVER_ADDRESS, new ethers.providers.Web3Provider(connectedProvider))
  const resolvedAddress: string = await resolverContract.addr(nodehash)
  if (resolvedAddress !== ethers.constants.AddressZero) {
    return resolvedAddress
  }

  return undefined
}

export function shorten(address: string) {
  return address ? address.slice(0, 6) + '...' + address.slice(42 - 5) : ''
}
