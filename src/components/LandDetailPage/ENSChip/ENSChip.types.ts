import { RouteComponentProps } from 'react-router-dom'
import { ENS } from 'modules/ens/types'

export type Props = {
  ens: ENS
  isLoading: boolean
  onIconClick: () => void
} & RouteComponentProps

export type MapStateProps = Pick<Props, 'isLoading'>
export type OwnProps = Pick<Props, 'ens' | 'onIconClick'>
