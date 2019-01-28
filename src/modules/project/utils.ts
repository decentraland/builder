import { Project } from 'modules/project/types'
import { getDimensions } from 'lib/layout'

export function getProjectDimensions(project: Project): string {
  const { rows, cols } = project.parcelLayout
  return getDimensions(rows, cols)
}
