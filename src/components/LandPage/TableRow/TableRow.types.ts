import { RouteComponentProps } from 'react-router-dom'
import { Land, Rental } from 'modules/land/types'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  land: Land
  deployments: Deployment[]
  rental: Rental | null
} & RouteComponentProps

export type MapStateProps = Pick<Props, 'deployments' | 'rental'>
export type OwnProps = Pick<Props, 'land'>
