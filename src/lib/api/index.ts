import { Omit } from 'decentraland-dapps/dist/lib/types'

import { User } from 'modules/user/types'
import { Scene } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { Deployment, ContentManifest, ContentServiceFile, ContentUploadRequestMetadata } from 'modules/deployment/types'

import { assets } from './assets'
import { avatars } from './avatars'
import { builder } from './builder'
import { content } from './content'
import { dar } from './dar'
import { email, EMAIL_INTEREST } from './email'
import { marketplace } from './marketplace'

export const api = {
  fetchAssetPack: (id: string) => assets.fetchAssetPack(id),
  fetchAssetPacks: () => assets.fetchAssetPacks(),
  fetchUser: (accessToken?: string) => avatars.fetchUser(accessToken),
  deleteDeployment: (id: string) => builder.deleteDeployment(id),
  deleteProject: (id: string) => builder.deleteProject(id),
  deployToPool: (project: Omit<Project, 'thumbnail'>, scene: Scene, user: User) => builder.deployToPool(project, scene, user),
  fetchDeployments: () => builder.fetchDeployments(),
  fetchManifest: (id: string) => builder.fetchManifest(id),
  fetchProjects: () => builder.fetchProjects(),
  saveDeployment: (deployment: Deployment) => builder.saveDeployment(deployment),
  saveProject: (project: Project, scene: Scene) => builder.saveProject(project, scene),
  saveThumbnail: (project: Project) => builder.saveThumbnail(project),
  uploadMedia: (
    projectId: string,
    thumbnail: Blob,
    shots: Record<string, Blob>,
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) => builder.uploadMedia(projectId, thumbnail, shots, onUploadProgress),
  fetchValidation: (x: number, y: number) => content.fetchValidation(x, y),
  uploadContent: (
    rootCID: string,
    manifest: ContentManifest,
    metadata: ContentUploadRequestMetadata,
    files: ContentServiceFile[],
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) => content.uploadContent(rootCID, manifest, metadata, files, onUploadProgress),
  fetchCollectibleAssets: (registry: string, ownerAddress: string) => dar.fetchCollectibleAssets(registry, ownerAddress),
  fetchCollectibleRegistries: () => dar.fetchCollectibleRegistries(),
  reportEmail: (_email: string, interest: EMAIL_INTEREST) => email.reportEmail(_email, interest),
  fetchAuthorizedParcels: (address: string) => marketplace.fetchAuthorizedParcels(address)
}
