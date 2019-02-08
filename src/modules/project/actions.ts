import { action } from 'typesafe-actions'
import { Project } from 'modules/project/types'
import { Template } from 'modules/template/types'
import { SceneDefinition } from 'modules/scene/types'

// Create project from template

export const CREATE_PROJECT_FROM_TEMPLATE = 'Create project from template'

export const createProjectFromTemplate = (template: Template, meta: CreateProjectFromTemplateMeta = {}) =>
  action(CREATE_PROJECT_FROM_TEMPLATE, { template }, meta)

type CreateProjectFromTemplateMeta = { onSuccess?: (project: Project, scene: SceneDefinition) => any }

export type CreateProjectFromTemplateAction = ReturnType<typeof createProjectFromTemplate>

// Create project

export const CREATE_PROJECT = 'Create project'

export const createProject = (project: Project) => action(CREATE_PROJECT, { project })

export type CreateProjectAction = ReturnType<typeof createProject>

// Edit project

export const EDIT_PROJECT = 'Edit project'

export const editProject = (id: string, project: Partial<Project>) => action(EDIT_PROJECT, { id, project })

export type EditProjectAction = ReturnType<typeof editProject>

// Delete project

export const DELETE_PROJECT = 'Delete project'

export const deleteProject = (id: string) => action(DELETE_PROJECT, { id })

export type DeleteProjectAction = ReturnType<typeof deleteProject>

// Duplicate project

export const DUPLICATE_PROJECT = 'Duplicate project'

export const duplicateProject = (id: string) => action(DUPLICATE_PROJECT, { id })

export type DuplicateProjectAction = ReturnType<typeof duplicateProject>
