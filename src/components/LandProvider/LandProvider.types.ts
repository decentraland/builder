import { Land } from 'modules/land/types'
import { Dispatch } from 'redux'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  id: string | null
  land: Land | null
  isLoading: boolean
  deployments: Deployment[]
  children: (id: string | null, land: Land | null, deployments: Deployment[], isLoading: boolean) => React.ReactNode
}

export type MapStateProps = Pick<Props, 'id' | 'land' | 'isLoading' | 'deployments'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
export type OwnProps = Partial<Pick<Props, 'id'>>
