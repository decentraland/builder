import { Land } from 'modules/land/types'
import { Project } from 'modules/project/types'

export type Props = {
  className?: string
  children: (land: Land, projects: Project[]) => React.ReactNode
}
