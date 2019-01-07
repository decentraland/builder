import { action } from 'typesafe-actions'
import { Project } from 'modules/project/types'

// Create project

export const CREATE_PROJECT = 'Create project'

export const createProject = (project: Project) => action(CREATE_PROJECT, { project })

export type CreateProjectAction = ReturnType<typeof createProject>
