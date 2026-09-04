import { action } from 'typesafe-actions'

import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Project, Manifest } from 'modules/project/types'
import { SDKVersion, Scene } from 'modules/scene/types'
import { Pool } from 'modules/pool/types'
import { PreviewType } from 'modules/editor/types'

// Create project (like SET_PROJECT but only called on creation)

export const CREATE_PROJECT = 'Create project'

export const createProject = (project: Project, sdkVersion: SDKVersion = SDKVersion.SDK6) => action(CREATE_PROJECT, { project, sdkVersion })

export type CreateProjectAction = ReturnType<typeof createProject>

// Set project

export const SET_PROJECT = 'Set project'

export const setProject = (project: Project) => action(SET_PROJECT, { project })

export type SetProjectAction = ReturnType<typeof setProject>

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

// Export project

export const EXPORT_PROJECT_REQUEST = '[Request] Export project'
export const EXPORT_PROJECT_SUCCESS = '[Success] Export project'

export const exportProjectRequest = (project: Project, migrateToSDK7 = false) => action(EXPORT_PROJECT_REQUEST, { project, migrateToSDK7 })
export const exportProjectSuccess = () => action(EXPORT_PROJECT_SUCCESS, {})

export type ExportProjectRequestAction = ReturnType<typeof exportProjectRequest>
export type ExportProjectSuccessAction = ReturnType<typeof exportProjectSuccess>

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

export const loadPublicProjectRequest = (id: string, type: PreviewType.PUBLIC | PreviewType.POOL) =>
  action(LOAD_PUBLIC_PROJECT_REQUEST, { id, type })
export const loadPublicProjectSuccess = (project: Project | Pool, type: PreviewType.PUBLIC | PreviewType.POOL) =>
  action(LOAD_PUBLIC_PROJECT_SUCCESS, { project, type })
export const loadPublicProjectFailure = (error: string) => action(LOAD_PUBLIC_PROJECT_FAILURE, { error })

export type LoadPublicProjectRequestAction = ReturnType<typeof loadPublicProjectRequest>
export type LoadPublicProjectSuccessAction = ReturnType<typeof loadPublicProjectSuccess>
export type LoadPublicProjectFailureAction = ReturnType<typeof loadPublicProjectFailure>

// Load project manifest

export const LOAD_MANIFEST_REQUEST = '[Request] Load manifest'
export const LOAD_MANIFEST_SUCCESS = '[Success] Load manifest'
export const LOAD_MANIFEST_FAILURE = '[Failure] Load manifest'

export const loadManifestRequest = (id: string, type: PreviewType = PreviewType.PROJECT) => action(LOAD_MANIFEST_REQUEST, { id, type })
export const loadManifestSuccess = (manifest: Manifest) => action(LOAD_MANIFEST_SUCCESS, { manifest })
export const loadManifestFailure = (error: string) => action(LOAD_MANIFEST_FAILURE, { error })

export type LoadManifestRequestAction = ReturnType<typeof loadManifestRequest>
export type LoadManifestSuccessAction = ReturnType<typeof loadManifestSuccess>
export type LoadManifestFailureAction = ReturnType<typeof loadManifestFailure>

// Load project scene
export const LOAD_PROJECT_SCENE_REQUEST = '[Request] Load project scene'
export const LOAD_PROJECT_SCENE_SUCCESS = '[Success] Load project scene'
export const LOAD_PROJECT_SCENE_FAILURE = '[Failure] Load project scene'

export const loadProjectSceneRequest = (project: Project, type: PreviewType = PreviewType.PROJECT) =>
  action(LOAD_PROJECT_SCENE_REQUEST, { project, type })
export const loadProjectSceneSuccess = (scene: Scene) => action(LOAD_PROJECT_SCENE_SUCCESS, { scene })
export const loadProjectSceneFailure = (error: string) => action(LOAD_PROJECT_SCENE_FAILURE, { error })

export type LoadProjectSceneRequestAction = ReturnType<typeof loadProjectSceneRequest>
export type LoadProjectSceneSuccessAction = ReturnType<typeof loadProjectSceneSuccess>
export type LoadProjectSceneFailureAction = ReturnType<typeof loadProjectSceneFailure>
