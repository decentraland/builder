import { Project } from 'modules/project/types'

export type Props = {
  project: Project
  onMouseEnter: (project: Project) => void
  onMouseLeave: (project: Project) => void
}
