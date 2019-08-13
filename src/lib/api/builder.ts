import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { authorize } from './auth'
import { Rotation, Deployment } from 'modules/deployment/types'
import { Project, Manifest } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { createManifest } from 'modules/project/export'
import { dataURLToBlob } from 'modules/media/utils'
import { runMigrations } from 'modules/migrations/utils'
import { migrations } from 'modules/migrations/manifest'

export const BUILDER_SERVER_URL = env.get('REACT_APP_BUILDER_SERVER_URL', '')

// Remote project

export type RemoteProject = {
  id: string
  title: string
  description: string
  thumbnail: string
  scene_id: string
  user_id: string | null
  rows: number
  cols: number
  created_at: string
  updated_at: string
}

/**
 * Transforms a Project into a RemoteProject for saving purposes only.
 * The `thumbnail` is omitted.
 */
function toRemoteProject(project: Project): Omit<RemoteProject, 'thumbnail'> {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    scene_id: project.sceneId,
    user_id: project.userId,
    rows: project.layout.rows,
    cols: project.layout.cols,
    created_at: project.createdAt,
    updated_at: project.updatedAt
  }
}

function fromRemoteProject(remoteProject: RemoteProject): Project {
  return {
    id: remoteProject.id,
    title: remoteProject.title,
    description: remoteProject.description,
    thumbnail: `${BUILDER_SERVER_URL}/projects/${remoteProject.id}/media/thumbnail.png`,
    sceneId: remoteProject.scene_id,
    userId: remoteProject.user_id,
    layout: {
      rows: remoteProject.rows,
      cols: remoteProject.cols
    },
    createdAt: remoteProject.created_at,
    updatedAt: remoteProject.updated_at
  }
}

// Remote deployment

export type RemoteDeployment = {
  id: string
  last_published_cid: string | null
  is_dirty: boolean
  x: number
  y: number
  rotation: Rotation
  user_id: string | null
  created_at: string
  updated_at: string
}

export function toRemoteDeployment(deployment: Deployment): RemoteDeployment {
  return {
    id: deployment.id,
    last_published_cid: deployment.lastPublishedCID,
    is_dirty: deployment.isDirty,
    x: deployment.placement.point.x,
    y: deployment.placement.point.y,
    rotation: deployment.placement.rotation,
    user_id: deployment.userId,
    created_at: deployment.createdAt,
    updated_at: deployment.updatedAt
  }
}

export function fromRemoteDeployment(remoteDeployment: RemoteDeployment): Deployment {
  return {
    id: remoteDeployment.id,
    lastPublishedCID: remoteDeployment.last_published_cid,
    isDirty: remoteDeployment.is_dirty,
    placement: {
      point: {
        x: remoteDeployment.x,
        y: remoteDeployment.y
      },
      rotation: remoteDeployment.rotation
    },
    userId: remoteDeployment.user_id,
    createdAt: remoteDeployment.created_at,
    updatedAt: remoteDeployment.updated_at
  }
}

// API

export class BuilderAPI extends BaseAPI {
  async deployToPool(projectId: string) {
    await this.request('put', `/projects/${projectId}/pool`, null, authorize())
    return
  }

  async uploadMedia(
    projectId: string,
    preview: Blob,
    shots: Record<string, Blob>,
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) {
    const formData = new FormData()
    formData.append('preview', preview)
    formData.append('north', shots.north)
    formData.append('east', shots.east)
    formData.append('south', shots.south)
    formData.append('west', shots.west)

    await this.request('post', `/projects/${projectId}/media`, formData, {
      onUploadProgress,
      ...authorize()
    })
  }

  async fetchDeployments() {
    const remoteDeployments: RemoteDeployment[] = await this.request('get', `/deployments`, null, authorize())
    return remoteDeployments.map(fromRemoteDeployment)
  }

  async saveDeployment(deployment: Deployment) {
    await this.request('put', `/projects/${deployment.id}/deployment`, { deployment: toRemoteDeployment(deployment) }, authorize())
  }

  async deleteDeployment(id: string) {
    await this.request('delete', `/projects/${id}/deployment`, null, authorize())
    return
  }

  async fetchProjects() {
    const { items }: { items: RemoteProject[]; total: number } = await this.request('get', `/projects`, null, authorize())
    return items.map(fromRemoteProject)
  }

  async saveProject(project: Project, scene: Scene) {
    const manifest = createManifest(toRemoteProject(project), scene)
    await this.request('put', `/projects/${project.id}/manifest`, { manifest }, authorize())
  }

  async saveThumbnail(project: Project) {
    if (!project.thumbnail) return

    const blob = dataURLToBlob(project.thumbnail)
    const formData = new FormData()
    if (blob) {
      formData.append('thumbnail', blob)
      await this.request('post', `/projects/${project.id}/media`, formData, authorize())
    }
  }

  async deleteProject(id: string) {
    await this.request('delete', `/projects/${id}`, null, authorize())
    return
  }

  async fetchManifest(id: string) {
    const remoteManifest = await this.request('get', `/projects/${id}/manifest`, null, authorize())
    const manifest = {
      ...remoteManifest,
      project: fromRemoteProject(remoteManifest.project)
    } as Manifest

    return runMigrations(manifest, migrations)
  }
}

export const builder = new BuilderAPI(BUILDER_SERVER_URL)
