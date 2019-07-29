import { action } from 'typesafe-actions'

import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Project, SaveFile } from 'modules/project/types'
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
export const editProjectFailure = (projectId: string, error: string) => action(EDIT_PROJECT_FAILURE, { projectId, error })

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

export const EXPORT_PROJECT_REQUEST = '[Request] Export project'
export const EXPORT_PROJECT_SUCCESS = '[Success] Export project'

export const exportProjectRequest = (project: Project) => action(EXPORT_PROJECT_REQUEST, { project })
export const exportProjectSuccess = () => action(EXPORT_PROJECT_SUCCESS, {})

export type ExportProjectRequestAction = ReturnType<typeof exportProjectRequest>
export type ExportProjectSuccessAction = ReturnType<typeof exportProjectSuccess>

// Import project

export const IMPORT_PROJECT = 'Import project'

export const importProject = (projects: SaveFile[]) => action(IMPORT_PROJECT, { projects })

export type ImportProjectAction = ReturnType<typeof importProject>

// Loud cloud projects

export const LOAD_PROJECTS_REQUEST = '[Request] Load projects'
export const LOAD_PROJECTS_SUCCESS = '[Success] Load projects'
export const LOAD_PROJECTS_FAILURE = '[Failure] Load projects'

export const loadProjectsRequest = () => action(LOAD_PROJECTS_REQUEST, {})
export const loadProjectsSuccess = (projects: ModelById<Project>) => action(LOAD_PROJECTS_SUCCESS, { projects })
export const loadProjectsFailure = (error: string) => action(LOAD_PROJECTS_FAILURE, { error })

export type LoadProjectsRequestAction = ReturnType<typeof loadProjectsRequest>
export type LoadProjectsSuccessAction = ReturnType<typeof loadProjectsSuccess>
export type LoadProjectsFailureAction = ReturnType<typeof loadProjectsFailure>

// Load individual project

export const LOAD_PROJECT_REQUEST = '[Request] Load project'
export const LOAD_PROJECT_SUCCESS = '[Success] Load project'
export const LOAD_PROJECT_FAILURE = '[Failure] Load project'

export const loadProjectRequest = () => action(LOAD_PROJECT_REQUEST, {})
export const loadProjectSuccess = (manifest: SaveFile) => action(LOAD_PROJECT_SUCCESS, { manifest })
export const loadProjectFailure = (error: string) => action(LOAD_PROJECT_FAILURE, { error })

export type LoadProjectRequestAction = ReturnType<typeof loadProjectRequest>
export type LoadProjectSuccessAction = ReturnType<typeof loadProjectSuccess>
export type LoadProjectFailureAction = ReturnType<typeof loadProjectFailure>
