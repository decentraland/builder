import { BaseProject } from 'modules/project/types'

export type Props = {
  project: BaseProject
  onClick: (project: BaseProject) => any
}
