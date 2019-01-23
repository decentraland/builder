import { Project } from 'modules/project/types'

export function getProjectDimensions(project: Project): string {
  const { rows, cols } = project.parcelLayout
  return `${rows * 10}x${cols * 10}m`
}
