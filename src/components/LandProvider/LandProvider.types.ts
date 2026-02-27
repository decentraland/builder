import { Land, Rental } from 'modules/land/types'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  id: string | null
  land: Land | null
  rental: Rental | null
  deployments: Deployment[]
  isLoading: boolean
  children: (
    id: string | null,
    land: Land | null,
    isLoading: boolean,
    associations: { deployments: Deployment[]; rental: Rental | null }
  ) => React.ReactNode
}

export type ContainerProps = {
  id?: string | null
  children: (
    id: string | null,
    land: Land | null,
    isLoading: boolean,
    associations: { deployments: Deployment[]; rental: Rental | null }
  ) => React.ReactNode
}
