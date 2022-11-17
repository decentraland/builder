import { Dispatch } from 'redux'
import { Land, Rental } from 'modules/land/types'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  x: number
  y: number
  visible: boolean
  land: Land
  deployments: Deployment[]
  rentals: Rental[]
}

export type MapStateProps = Pick<Props, 'deployments' | 'rentals'>
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'x' | 'y' | 'visible' | 'land'>
