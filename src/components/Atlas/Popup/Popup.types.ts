import { Dispatch } from 'redux'
import { Land } from 'modules/land/types'
import { Project } from 'modules/project/types'

export type Props = {
  x: number
  y: number
  visible: boolean
  land: Land
  projects: Project[]
}

export type MapStateProps = Pick<Props, 'projects'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'x' | 'y' | 'visible' | 'land'>
