import { Deployment } from 'modules/deployment/types'

export type Props = {
  deployment: Deployment
  onMouseEnter: (deployment: Deployment) => void
  onMouseLeave: (deployment: Deployment) => void
}
