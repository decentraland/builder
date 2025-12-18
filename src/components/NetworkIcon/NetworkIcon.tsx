import { Props } from './NetworkIcon.types'
import { imgSrcByNetwork, NETWORK_ICON_DATA_TEST_ID } from './utils'

export const NetworkIcon = (props: Props) => (
  <img
    data-testid={NETWORK_ICON_DATA_TEST_ID}
    src={imgSrcByNetwork[props.network as keyof typeof imgSrcByNetwork]}
    alt={props.network}
    className={props.className}
  />
)
