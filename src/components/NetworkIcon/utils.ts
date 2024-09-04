import { ContractNetwork } from '@dcl/schemas'
import ethereumSvg from '../../icons/ethereum.svg'
import polygonSvg from '../../icons/polygon.svg'

export const NETWORK_ICON_DATA_TEST_ID = 'network-icon'

export const imgSrcByNetwork = {
  [ContractNetwork.MAINNET]: ethereumSvg,
  [ContractNetwork.MATIC]: polygonSvg,
  [ContractNetwork.SEPOLIA]: ethereumSvg,
  [ContractNetwork.AMOY]: polygonSvg
}
