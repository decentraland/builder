import path from 'path'
import uuid from 'uuid'
const CID = require('cids')
const MemoryDatastore = require('interface-datastore').MemoryDatastore
const pull = require('pull-stream')
const Importer = require('ipfs-unixfs-engine').Importer
const toBuffer = require('blob-to-buffer')
import { ContentIdentifier, ContentServiceFile, ContentManifest, Deployment, DeploymentStatus } from './types'
import { Project } from 'modules/project/types'
import { Scene, ComponentType } from 'modules/scene/types'

export async function getCID(files: ContentServiceFile[], shareRoot: boolean): Promise<string> {
  const importer = new Importer(new MemoryDatastore(), { onlyHash: true })
  return new Promise<string>((resolve, reject) => {
    pull(
      pull.values(files),
      pull.asyncMap((file: ContentServiceFile, cb: any) => {
        const data = {
          path: shareRoot ? '/tmp/' + file.path : file.path,
          content: file.content
        }
        cb(null, data)
      }),
      importer,
      pull.onEnd(() => {
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

export async function getFileManifest(files: ContentServiceFile[]): Promise<ContentManifest> {
  const result: Record<string, ContentIdentifier> = {}
  for (const file of files) {
    const fileCID: string = await getCID([{ path: path.basename(file.path), content: file.content, size: file.size }], false)
    result[file.path] = { cid: fileCID, name: file.path }
  }
  return result
}

export function makeContentFile(path: string, content: string | Blob): Promise<ContentServiceFile> {
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
    if (project.title === 'Palito') {
      console.log(
        project,
        deployment,
        projectTimestamp,
        deploymentTimestamp,
        projectTimestamp - deploymentTimestamp,
        new Date(projectTimestamp),
        new Date(deploymentTimestamp),
        console.log
      )
    }
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

export const getEmptyDeployment = (projectId: string): [Project, Scene] => {
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
    updatedAt: new Date().toISOString()
  }

  const scene: Scene = {
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
          assetId: 'da1fed3c954172146414a66adfa134f7a5e1cb49c902713481bf2fe94180c2cf'
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
      da1fed3c954172146414a66adfa134f7a5e1cb49c902713481bf2fe94180c2cf: {
        id: 'da1fed3c954172146414a66adfa134f7a5e1cb49c902713481bf2fe94180c2cf',
        assetPackId: 'e6fa9601-3e47-4dff-9a84-e8e017add15a',
        name: 'Bermuda Grass',
        model: 'FloorBaseGrass_01/FloorBaseGrass_01.glb',
        script: null,
        thumbnail: 'https://builder-api.decentraland.org/v1/storage/assets/QmexuPHcbEtQCR11dPXxKZmRjGuY4iTooPJYfST7hW71DE',
        tags: ['genesis', 'city', 'town', 'ground'],
        category: 'ground',
        contents: {
          'FloorBaseGrass_01/FloorBaseGrass_01.glb': 'QmSyvWnb5nKCaGHw9oHLSkwywvS5NYpj6vgb8L121kWveS',
          'FloorBaseGrass_01/Floor_Grass01.png.png': 'QmT1WfQPMBVhgwyxV5SfcfWivZ6hqMCT74nxdKXwyZBiXb',
          'FloorBaseGrass_01/thumbnail.png': 'QmexuPHcbEtQCR11dPXxKZmRjGuY4iTooPJYfST7hW71DE'
        },
        metrics: {
          meshes: 0,
          bodies: 0,
          materials: 0,
          textures: 0,
          triangles: 0,
          entities: 0
        },
        parameters: [],
        actions: []
      }
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
      assetId: 'da1fed3c954172146414a66adfa134f7a5e1cb49c902713481bf2fe94180c2cf',
      componentId: '25783992-5e2f-4879-b734-eda41c0cc4c0'
    }
  }

  return [project, scene]
}
