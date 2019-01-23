import { action } from 'typesafe-actions'
import { Project } from 'modules/project/types'
import { Template } from 'modules/template/types'

// Create project

export const CREATE_PROJECT_FROM_TEMPLATE = 'Create project from template'

export const createProjectFromTemplate = (template: Template) => action(CREATE_PROJECT_FROM_TEMPLATE, { template })

export type CreateProjectFromTemplateAction = ReturnType<typeof createProjectFromTemplate>

export const CREATE_PROJECT = 'Create project'

export const createProject = (project: Project) => action(CREATE_PROJECT, { project })

export type CreateProjectAction = ReturnType<typeof createProject>
