import { action } from 'typesafe-actions'

import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Project, Manifest } from 'modules/project/types'
import { Template } from 'modules/template/types'
import { Scene } from 'modules/scene/types'
import { Pool } from 'modules/pool/types'

// Create project from template

export const CREATE_PROJECT_FROM_TEMPLATE = 'Create project from template'

export const createProjectFromTemplate = (template: Template, meta: CreateProjectFromTemplateMeta = {}) =>
  action(CREATE_PROJECT_FROM_TEMPLATE, { template }, meta)

type CreateProjectFromTemplateMeta = { title?: string; description?: string; onSuccess?: (project: Project, scene: Scene) => any }

export type CreateProjectFromTemplateAction = ReturnType<typeof createProjectFromTemplate>

// Create project (like SET_PROJECT but only called on creation)

export const CREATE_PROJECT = 'Create project'

export const createProject = (project: Project) => action(CREATE_PROJECT, { project })

export type CreateProjectAction = ReturnType<typeof createProject>

// Set project

export const SET_PROJECT = 'Set project'

export const setProject = (project: Project) => action(SET_PROJECT, { project })

export type SetProjectAction = ReturnType<typeof setProject>

// Edit project

export const EDIT_PROJECT = 'Edit project'

export const editProject = (id: string, project: Partial<Project>) => action(EDIT_PROJECT, { id, project })

export type EditProjectAction = ReturnType<typeof editProject>

// Share project

export const SHARE_PROJECT = 'Share project'

export const shareProject = (id: string) => action(SHARE_PROJECT, { id })

export type ShareProjectAction = ReturnType<typeof shareProject>

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

export const importProject = (projects: Manifest[]) => action(IMPORT_PROJECT, { projects })

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

// Load public cloud project

export const LOAD_PUBLIC_PROJECT_REQUEST = '[Request] Load public project'
export const LOAD_PUBLIC_PROJECT_SUCCESS = '[Success] Load public project'
export const LOAD_PUBLIC_PROJECT_FAILURE = '[Failure] Load public project'

export const loadPublicProjectRequest = (id: string, type: 'public' | 'pool') => action(LOAD_PUBLIC_PROJECT_REQUEST, { id, type })
export const loadPublicProjectSuccess = (project: Project | Pool, type: 'public' | 'pool') =>
  action(LOAD_PUBLIC_PROJECT_SUCCESS, { project, type })
export const loadPublicProjectFailure = (error: string) => action(LOAD_PUBLIC_PROJECT_FAILURE, { error })

export type LoadPublicProjectRequestAction = ReturnType<typeof loadPublicProjectRequest>
export type LoadPublicProjectSuccessAction = ReturnType<typeof loadPublicProjectSuccess>
export type LoadPublicProjectFailureAction = ReturnType<typeof loadPublicProjectFailure>

// Load project manifest

export const LOAD_MANIFEST_REQUEST = '[Request] Load manifest'
export const LOAD_MANIFEST_SUCCESS = '[Success] Load manifest'
export const LOAD_MANIFEST_FAILURE = '[Failure] Load manifest'

export const loadManifestRequest = (id: string, type: 'project' | 'public' | 'pool' = 'project') =>
  action(LOAD_MANIFEST_REQUEST, { id, type })
export const loadManifestSuccess = (manifest: Manifest) => action(LOAD_MANIFEST_SUCCESS, { manifest })
export const loadManifestFailure = (error: string) => action(LOAD_MANIFEST_FAILURE, { error })

export type LoadManifestRequestAction = ReturnType<typeof loadManifestRequest>
export type LoadManifestSuccessAction = ReturnType<typeof loadManifestSuccess>
export type LoadManifestFailureAction = ReturnType<typeof loadManifestFailure>
