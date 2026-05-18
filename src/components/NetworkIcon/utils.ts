import { ContractNetwork } from '@dcl/schemas'
import ethereumSvg from '../../icons/ethereum.svg'
import polygonSvg from '../../icons/polygon.svg'

export const NETWORK_ICON_DATA_TEST_ID = 'network-icon'

// TODO: Replace ethereumSvg fallbacks below with dedicated icons once the
// design team provides assets for Base, ApeChain, and Monad networks.
// Tracked in: https://github.com/decentraland/builder/issues/TBD
export const imgSrcByNetwork = {
  [ContractNetwork.MAINNET]: ethereumSvg,
  [ContractNetwork.MATIC]: polygonSvg,
  [ContractNetwork.SEPOLIA]: ethereumSvg,
  [ContractNetwork.AMOY]: polygonSvg,
  [ContractNetwork.BASE_MAINNET]: ethereumSvg,
  [ContractNetwork.BASE_SEPOLIA]: ethereumSvg,
  [ContractNetwork.APE_MAINNET]: ethereumSvg,
  [ContractNetwork.APE_CALDERA]: ethereumSvg,
  [ContractNetwork.MONAD_MAINNET]: ethereumSvg,
  [ContractNetwork.MONAD_TESTNET]: ethereumSvg
}
