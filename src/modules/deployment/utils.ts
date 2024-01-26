import uuid from 'uuid'
import CID from 'cids'
import pull from 'pull-stream'
import { MemoryDatastore } from 'interface-datastore'
import { EntityContentItemReference } from '@dcl/hashing'
import { Asset } from 'modules/asset/types'
import { Project } from 'modules/project/types'
import { ComponentType, SceneSDK6 } from 'modules/scene/types'
import { getContentsStorageUrl } from 'lib/api/builder'
import { getCatalystContentUrl } from 'lib/api/peer'
import { ContentServiceFile, Deployment, DeploymentStatus, SceneDefinition } from './types'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Importer } from 'ipfs-unixfs-engine'

export const UNPUBLISHED_PROJECT_ID = 'unpublished-project'

export const getDefaultGroundAsset = (): Asset => ({
  id: 'c9b17021-765c-4d9a-9966-ce93a9c323d1',
  name: 'Bermuda Grass',
  thumbnail: getContentsStorageUrl('QmexuPHcbEtQCR11dPXxKZmRjGuY4iTooPJYfST7hW71DE'),
  model: 'FloorBaseGrass_01/FloorBaseGrass_01.glb',
  script: null,
  tags: ['ground'],
  category: 'ground',
  contents: {
    'FloorBaseGrass_01/FloorBaseGrass_01.glb': 'QmSyvWnb5nKCaGHw9oHLSkwywvS5NYpj6vgb8L121kWveS',
    'FloorBaseGrass_01/Floor_Grass01.png.png': 'QmT1WfQPMBVhgwyxV5SfcfWivZ6hqMCT74nxdKXwyZBiXb',
    'FloorBaseGrass_01/thumbnail.png': 'QmexuPHcbEtQCR11dPXxKZmRjGuY4iTooPJYfST7hW71DE'
  },
  assetPackId: 'e6fa9601-3e47-4dff-9a84-e8e017add15a',
  metrics: {
    triangles: 0,
    materials: 0,
    meshes: 0,
    bodies: 0,
    entities: 0,
    textures: 0
  },
  parameters: [],
  actions: []
})

export async function getCID(files: ContentServiceFile[]): Promise<string> {
  const importer = new Importer(new MemoryDatastore(), { onlyHash: true })
  return new Promise<string>((resolve, reject) => {
    pull(
      pull.values(files),
      pull.asyncMap((file: ContentServiceFile, cb: any) => {
        const data = {
          path: file.path,
          content: file.content
        }
        cb(null, data)
      }),
      importer,
      pull.onEnd(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return importer.flush((err: any, content: any) => {
          if (err) {
            reject(err)
          }
          resolve(new CID(content).toBaseEncodedString())
        })
      })
    )
  })
}

export async function makeContentFile(path: string, content: string | Blob): Promise<ContentServiceFile> {
  const toBuffer = (await import('blob-to-buffer')).default
  return new Promise((resolve, reject) => {
    if (typeof content === 'string') {
      const buffer = Buffer.from(content)
      resolve({ path, content: buffer, size: Buffer.byteLength(buffer) })
    } else if (content instanceof Blob) {
      toBuffer(content, (err: Error, buffer: Buffer) => {
        if (err) reject(err)
        resolve({ path, content: buffer, size: Buffer.byteLength(buffer) })
      })
    } else {
      reject(new Error('Unable to create ContentFile: content must be a string or a Blob'))
    }
  })
}

export function getStatus(project: Project | null, deployment: Deployment | null) {
  if (project && deployment) {
    const projectTimestamp = +new Date(project.updatedAt)
    const deploymentTimestamp = +new Date(deployment.timestamp)
    return deploymentTimestamp > projectTimestamp ? DeploymentStatus.PUBLISHED : DeploymentStatus.NEEDS_SYNC
  }

  return DeploymentStatus.UNPUBLISHED
}

export function mergeStatuses(statuses: DeploymentStatus[]) {
  if (statuses.length === 0 || statuses.some(status => status === DeploymentStatus.UNPUBLISHED)) {
    return DeploymentStatus.UNPUBLISHED
  } else if (statuses.some(status => status === DeploymentStatus.NEEDS_SYNC)) {
    return DeploymentStatus.NEEDS_SYNC
  } else {
    return DeploymentStatus.PUBLISHED
  }
}

export function getDeployment(project: Project | null, deployments: Deployment[]) {
  // select a deployment that needs sync, or the first one
  return deployments.find(deployment => getStatus(project, deployment) === DeploymentStatus.NEEDS_SYNC) || deployments[0]
}

export const getEmptyDeployment = (projectId: string): [Project, SceneSDK6] => {
  const sceneId = uuid.v4()
  const project: Project = {
    id: projectId,
    title: 'Empty',
    description: '',
    thumbnail: '',
    isPublic: false,
    sceneId: sceneId,
    ethAddress: null,
    layout: {
      rows: 1,
      cols: 1
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isTemplate: false,
    video: null,
    templateStatus: null
  }

  const defaultGroundAsset = getDefaultGroundAsset()

  const scene: SceneSDK6 = {
    id: sceneId,
    entities: {
      '42d414e0-5d9f-40a0-884a-e0cbac9d7e5c': {
        id: '42d414e0-5d9f-40a0-884a-e0cbac9d7e5c',
        components: ['25783992-5e2f-4879-b734-eda41c0cc4c0', '49c32fc6-d7f7-4dba-bc55-7a89b898594a'],
        disableGizmos: true,
        name: 'entity'
      }
    },
    components: {
      '25783992-5e2f-4879-b734-eda41c0cc4c0': {
        id: '25783992-5e2f-4879-b734-eda41c0cc4c0',
        type: ComponentType.GLTFShape,
        data: {
          assetId: 'c9b17021-765c-4d9a-9966-ce93a9c323d1'
        }
      },
      '49c32fc6-d7f7-4dba-bc55-7a89b898594a': {
        id: '49c32fc6-d7f7-4dba-bc55-7a89b898594a',
        type: ComponentType.Transform,
        data: {
          position: {
            x: 8,
            y: 0,
            z: 8
          },
          rotation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1
          },
          scale: {
            x: 1,
            y: 1,
            z: 1
          }
        }
      }
    },
    assets: {
      [defaultGroundAsset.id]: defaultGroundAsset
    },
    metrics: {
      triangles: 32,
      materials: 1,
      meshes: 1,
      bodies: 1,
      entities: 1,
      textures: 0
    },
    limits: {
      triangles: 10000,
      materials: 20,
      meshes: 200,
      bodies: 300,
      entities: 200,
      textures: 10
    },
    ground: {
      assetId: 'c9b17021-765c-4d9a-9966-ce93a9c323d1',
      componentId: '25783992-5e2f-4879-b734-eda41c0cc4c0'
    }
  }

  return [project, scene]
}

function isUrl(maybeUrl: string) {
  try {
    new URL(maybeUrl)
  } catch (error) {
    return false
  }
  return true
}

export function getThumbnail(definition?: SceneDefinition | null, content?: EntityContentItemReference[]): string | null {
  if (!definition || !definition.display || !definition.display.navmapThumbnail) {
    return null
  }
  let thumbnail = definition.display.navmapThumbnail
  if (!isUrl(thumbnail) && content) {
    const file = content.find(reference => reference.file === thumbnail)
    if (file) {
      thumbnail = getCatalystContentUrl(file.hash)
    }
  }

  return thumbnail
}
