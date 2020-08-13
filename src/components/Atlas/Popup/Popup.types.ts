import { Dispatch } from 'redux'
import { Land } from 'modules/land/types'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  x: number
  y: number
  visible: boolean
  land: Land
  deployments: Deployment[]
}

export type MapStateProps = Pick<Props, 'deployments'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'x' | 'y' | 'visible' | 'land'>
