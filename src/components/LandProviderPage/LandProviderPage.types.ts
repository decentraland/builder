import { Land, Rental } from 'modules/land/types'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  className?: string
  children: (land: Land, associations: { deployments: Deployment[]; rental: Rental | null }) => React.ReactNode
}
