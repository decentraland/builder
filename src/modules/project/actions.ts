import { action } from 'typesafe-actions'

import { Project } from 'modules/project/types'
import { Template } from 'modules/template/types'
import { Scene } from 'modules/scene/types'
import { Asset } from 'modules/asset/types'

// Create project from template

export const CREATE_PROJECT_FROM_TEMPLATE = 'Create project from template'

export const createProjectFromTemplate = (template: Template, meta: CreateProjectFromTemplateMeta = {}) =>
  action(CREATE_PROJECT_FROM_TEMPLATE, { template }, meta)

type CreateProjectFromTemplateMeta = { onSuccess?: (project: Project, scene: Scene) => any }

export type CreateProjectFromTemplateAction = ReturnType<typeof createProjectFromTemplate>

// Create project

export const CREATE_PROJECT = 'Create project'

export const createProject = (project: Project) => action(CREATE_PROJECT, { project })

export type CreateProjectAction = ReturnType<typeof createProject>

// Edit project

export const EDIT_PROJECT_REQUEST = '[Request] Edit project'
export const EDIT_PROJECT_SUCCESS = '[Success] Edit project'
export const EDIT_PROJECT_FAILURE = '[Failure] Edit project'

export const editProjectRequest = (id: string, project: Partial<Project>, ground?: Asset) =>
  action(EDIT_PROJECT_REQUEST, { id, project, ground })
export const editProjectSuccess = (id: string, project: Partial<Project>) => action(EDIT_PROJECT_SUCCESS, { id, project })
export const editProjectFailure = (error: string) => action(EDIT_PROJECT_FAILURE, { error })

export type EditProjectRequestAction = ReturnType<typeof editProjectRequest>
export type EditProjectSuccessAction = ReturnType<typeof editProjectSuccess>
export type EditProjectFailureAction = ReturnType<typeof editProjectFailure>

// Edit project thumbnail

export const EDIT_PROJECT_THUMBNAIL = 'Edit project thumbnail'

export const editProjectThumbnail = (id: string, thumbnail: string) => action(EDIT_PROJECT_THUMBNAIL, { id, thumbnail })

export type EditProjectThumbnailAction = ReturnType<typeof editProjectThumbnail>

// Delete project

export const DELETE_PROJECT = 'Delete project'

export const deleteProject = (project: Project) => action(DELETE_PROJECT, { project })

export type DeleteProjectAction = ReturnType<typeof deleteProject>

// Duplicate project

export const DUPLICATE_PROJECT = 'Duplicate project'

export const duplicateProject = (project: Project) => action(DUPLICATE_PROJECT, { project })

export type DuplicateProjectAction = ReturnType<typeof duplicateProject>

// Export project

export const EXPORT_PROJECT = 'Export project'

export const exportProject = (project: Project) => action(EXPORT_PROJECT, { project })

export type ExportProjectAction = ReturnType<typeof exportProject>
