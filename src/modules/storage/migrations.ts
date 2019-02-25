import { utils } from 'decentraland-commons'

export const migrations = {
  2: (data: any) => {
    type V1Project = { parcelLayout: { rows: number; cols: number } }
    type V2Project = { layout: { rows: number; cols: number } }
    type V1ProjectState = { data: Record<string, V1Project> }
    type V2ProjectState = { data: Record<string, V2Project> }

    // The property parcelLayout from Project was renamed to layout, we'll iterate over each stored project to rename it
    const oldProjectState: V1ProjectState | undefined = data.project
    const project: V2ProjectState = { data: {} }

    if (oldProjectState) {
      for (const projectId in oldProjectState.data) {
        const oldProject = oldProjectState.data[projectId]
        project.data[projectId] = {
          ...utils.omit(oldProject, ['parcelLayout']),
          layout: oldProject.parcelLayout
        }
      }
    }
    return { ...data, project }
  }
}
