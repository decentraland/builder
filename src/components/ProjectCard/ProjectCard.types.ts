import { Project } from 'modules/project/types'

export type Props = {
  project: Project
  onClick?: (project: Project) => any
}
