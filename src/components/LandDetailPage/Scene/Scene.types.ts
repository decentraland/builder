import { Deployment } from 'modules/deployment/types'
import { ProjectState } from 'modules/project/reducer'
import { openModal } from 'modules/modal/actions'

export type Props = {
  deployment: Deployment
  projects: ProjectState['data']
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onMouseEnter: (deployment: Deployment) => void
  onMouseLeave: (deployment: Deployment) => void
}
