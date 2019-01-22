import { BaseProject } from '../../../modules/project/types'

export type Props = {
  projects: BaseProject[]
  onClick: (project: BaseProject) => any
}
