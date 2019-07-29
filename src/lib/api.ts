import { env } from 'decentraland-commons'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { Project } from 'modules/project/types'
import { User } from 'modules/user/types'
import { Scene } from 'modules/scene/types'
import { AssetRegistryResponse, DARAssetsResponse } from 'modules/asset/types'
import { ContentManifest, ContentUploadRequestMetadata, ContentServiceFile } from 'modules/deployment/types'
import { createHeaders } from 'modules/auth/utils'

export const API_URL = env.get('REACT_APP_API_URL', '')
export const ASSETS_URL = env.get('REACT_APP_ASSETS_URL', '')
export const EMAIL_SERVER_URL = env.get('REACT_APP_EMAIL_SERVER_URL', '')
export const DAR_URL = env.get('REACT_APP_DAR_URL', '')
export const BUILDER_SERVER_URL = env.get('REACT_APP_BUILDER_SERVER_URL', '')
export const CONTENT_SERVER_URL = env.get('REACT_APP_CONTENT_SERVER_URL', '')
export const MARKETPLACE_URL = env.get('REACT_APP_MARKETPLACE_URL', '')
export const AVATARS_API_URL = env.get('REACT_APP_AVATARS_API_URL', '')

export enum EMAIL_INTEREST {
  MOBILE = 'builder-app-mobile',
  TUTORIAL = 'builder-app-tutorial',
  PUBLISH_POOL = 'builder-publish-pool',
  PUBLISH_DIRECT = 'builder-publish-direct'
}

export class API extends BaseAPI {
  async fetchAssetPacks() {
    const data = await this.request('get', `${ASSETS_URL}`, {})
    return data.packs
  }

  fetchAssetPack(id: string) {
    return this.request('get', `${ASSETS_URL}/${id}.json`, {})
  }

  async fetchCollectibleRegistries() {
    const req = await fetch(DAR_URL)
    if (!req.ok) return []
    const resp = (await req.json()) as AssetRegistryResponse
    return resp.registries || [] // TODO: remove the || [] when the DAR stops sending registries: null
  }

  async fetchCollectibleAssets(registry: string, ownerAddress: string) {
    const req = await fetch(`${DAR_URL}/${registry}/address/${ownerAddress}`)
    if (!req.ok) return []
    const resp = (await req.json()) as DARAssetsResponse
    return resp.assets || [] // TODO: remove the || [] when the DAR stops sending assets: null
  }

  fetchAuthorizedParcels(address: string) {
    return this.request('get', `${MARKETPLACE_URL}/address/${address}/parcels/authorized`, {})
  }

  reportEmail(email: string, interest: EMAIL_INTEREST) {
    return this.request('post', `${EMAIL_SERVER_URL}`, { email, interest })
  }

  async deployToPool(project: Omit<Project, 'thumbnail'>, scene: Scene, user: User) {
    return this.request('post', `${BUILDER_SERVER_URL}/project/`, { entry: JSON.stringify({ version: 1, project, scene, user }) })
  }

  async publishScenePreview(
    projectId: string,
    thumbnail: Blob,
    shots: Record<string, Blob>,
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) {
    const formData = new FormData()
    formData.append('thumb', thumbnail)
    formData.append('north', shots.north)
    formData.append('east', shots.east)
    formData.append('south', shots.south)
    formData.append('west', shots.west)

    return this.request('post', `${BUILDER_SERVER_URL}/project/${projectId}/preview`, formData, {
      onUploadProgress
    })
  }

  async uploadToContentService(
    rootCID: string,
    manifest: ContentManifest,
    metadata: ContentUploadRequestMetadata,
    files: ContentServiceFile[],
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) {
    const data = new FormData()
    data.append('metadata', JSON.stringify(metadata))
    data.append(rootCID, JSON.stringify(Object.values(manifest)))

    for (let file of files) {
      const indentifier = manifest[file.path]
      let content = new Blob([file.content], {
        type: 'text/plain'
      })
      data.append(indentifier.cid, content, file.path)
    }

    try {
      await this.request('post', `${CONTENT_SERVER_URL}/mappings`, data, {
        onUploadProgress
      })
    } catch (e) {
      const { status } = e.response
      if (status === 401) {
        throw new Error('Your current address is not authorized to update the specified LAND')
      } else {
        throw new Error('Unable to update LAND')
      }
    }
  }

  async fetchContentServerValidation(x: number, y: number) {
    const req = await fetch(`${CONTENT_SERVER_URL}/validate?x=${x}&y=${y}`)
    const res = await req.json()
    return res
  }

  async fetchUser(idToken: string) {
    const headers = createHeaders(idToken)
    return this.request('get', `${AVATARS_API_URL}/profile`, null, { headers })
  }

  async saveProject(project: Project, scene: Scene) {
    console.log('Mocked: saveToCloud ', project, scene)
    return Promise.resolve()
  }

  async getProjects() {
    console.log('Mocked: getProjects')
    return Promise.resolve({
      data: [
        {
          cols: 1,
          createdAt: '2011-10-05T14:48:00.000Z',
          description: '',
          id: 'b3ad66e9-cb0f-4194-ab3a-71a8cb052225',
          rows: 1,
          sceneId: 'c025c9b6-4441-4f26-a3ed-ba3b254956b0',
          thumbnail: 'https://i.imgur.com/QF0QhYx.png',
          title: 'New project',
          updatedAt: '2011-10-05T14:48:00.000Z',
          userId: '28400175-8efc-4d4f-bfea-ee0142c8c9f3'
        },
        {
          cols: 1,
          createdAt: '2011-10-05T14:48:00.000Z',
          description: '',
          id: '3416cfcb-103f-4079-9fbd-0d0ced077508',
          rows: 1,
          sceneId: 'c025c9b6-4441-4f26-a3ed-ba3b254956b0',
          thumbnail: 'https://i.imgur.com/QF0QhYx.png',
          title: 'The project',
          updatedAt: '2011-10-05T14:48:00.000Z',
          userId: '28400175-8efc-4d4f-bfea-ee0142c8c9f3'
        },
        {
          cols: 1,
          createdAt: '2011-10-05T14:48:00.000Z',
          description: '',
          id: '70fbb0a6-a01b-4583-81cd-16ed835a2250',
          rows: 1,
          sceneId: 'c025c9b6-4441-4f26-a3ed-ba3b254956b0',
          thumbnail: 'https://i.imgur.com/QF0QhYx.png',
          title: 'anda',
          updatedAt: '2011-10-05T14:48:00.000Z',
          userId: '28400175-8efc-4d4f-bfea-ee0142c8c9f3'
        },
        {
          cols: 1,
          createdAt: '2011-10-05T14:48:00.000Z',
          description: '',
          id: '0b994e8a-a674-41c8-b796-7d222cbb0cd9',
          rows: 1,
          sceneId: 'c025c9b6-4441-4f26-a3ed-ba3b254956b0',
          thumbnail: 'https://i.imgur.com/QF0QhYx.png',
          title: 'no anda',
          updatedAt: '2011-10-05T14:48:00.000Z',
          userId: '28400175-8efc-4d4f-bfea-ee0142c8c9f3'
        },
        {
          cols: 1,
          createdAt: '2011-10-05T14:48:00.000Z',
          description: '',
          id: '95704b80-8e75-4439-a587-050fde3005e1',
          rows: 1,
          sceneId: 'c025c9b6-4441-4f26-a3ed-ba3b254956b0',
          thumbnail: 'https://i.imgur.com/QF0QhYx.png',
          title: 'New project',
          updatedAt: '2011-10-05T14:48:00.000Z',
          userId: '28400175-8efc-4d4f-bfea-ee0142c8c9f3'
        }
      ],
      ok: true
    })
  }

  getProject() {
    return {
      ok: true,
      data: {
        manifest: {
          version: 2,
          project: {
            id: '8673ea12-3137-433f-9206-d84795982487',
            title: 'New scene!',
            description: '',
            thumbnail: null,
            layout: { rows: 1, cols: 1 },
            parcels: [{ x: 0, y: 0 }],
            sceneId: 'c025c9b6-4441-4f26-a3ed-ba3b254956b0',
            createdAt: 1563201610437
          },
          scene: {
            id: 'c025c9b6-4441-4f26-a3ed-ba3b254956b0',
            entities: {
              '9f917f0d-688b-4390-bc78-79cc74da64bf': {
                id: '9f917f0d-688b-4390-bc78-79cc74da64bf',
                components: ['4952786e-d17b-48fe-bd75-a0b0abbd31ee', '825b86ca-eceb-478e-8f91-37c11ee57afc'],
                disableGizmos: true
              },
              '7bd1063b-de92-445b-aa1d-fccfe831569f': {
                id: '7bd1063b-de92-445b-aa1d-fccfe831569f',
                components: ['1c6c3a24-1895-4e54-84f7-776bdc576f5d', '30ef397c-3224-4a8e-afd9-647c1c8da75e']
              },
              '03d6df9a-6ff2-43c7-9587-e842791e0163': {
                id: '03d6df9a-6ff2-43c7-9587-e842791e0163',
                components: ['0fe9d98c-6d46-41f0-9591-1a319b84c1c5', '51ff50bb-8844-4edf-b47c-cd2e1e032655']
              }
            },
            components: {
              '4952786e-d17b-48fe-bd75-a0b0abbd31ee': {
                id: '4952786e-d17b-48fe-bd75-a0b0abbd31ee',
                type: 'GLTFShape',
                data: {
                  src: 'e6fa9601-3e47-4dff-9a84-e8e017add15a/FloorBaseGrass_01/FloorBaseGrass_01.glb',
                  mappings: {
                    'e6fa9601-3e47-4dff-9a84-e8e017add15a/FloorBaseGrass_01/FloorBaseGrass_01.glb':
                      'QmSyvWnb5nKCaGHw9oHLSkwywvS5NYpj6vgb8L121kWveS',
                    'e6fa9601-3e47-4dff-9a84-e8e017add15a/FloorBaseGrass_01/Floor_Grass01.png.png':
                      'QmT1WfQPMBVhgwyxV5SfcfWivZ6hqMCT74nxdKXwyZBiXb'
                  }
                }
              },
              '825b86ca-eceb-478e-8f91-37c11ee57afc': {
                id: '825b86ca-eceb-478e-8f91-37c11ee57afc',
                type: 'Transform',
                data: {
                  position: { x: 8, y: 0, z: 8 },
                  rotation: { x: 0, y: 0, z: 0, w: 1 }
                }
              },
              '1c6c3a24-1895-4e54-84f7-776bdc576f5d': {
                id: '1c6c3a24-1895-4e54-84f7-776bdc576f5d',
                type: 'GLTFShape',
                data: {
                  src: '83564d63-6e14-4469-abe6-60680391183c/ChineseGate_03/ChineseGate_03.glb',
                  mappings: {
                    '83564d63-6e14-4469-abe6-60680391183c/ChineseGate_03/ChineseGate_03.glb':
                      'QmX2TJP87MQES9pEKqf3qZSPscsgUbGdxKfiRrH6Z9dJjC',
                    '83564d63-6e14-4469-abe6-60680391183c/ChineseGate_03/file1.png': 'QmYACL8SnbXEonXQeRHdWYbfm8vxvaFAWnsLHUaDG4ABp5'
                  }
                }
              },
              '30ef397c-3224-4a8e-afd9-647c1c8da75e': {
                id: '30ef397c-3224-4a8e-afd9-647c1c8da75e',
                type: 'Transform',
                data: {
                  position: { x: 8, y: 0, z: 7 },
                  rotation: { x: 0, y: 0, z: 0, w: 1 }
                }
              },
              '0fe9d98c-6d46-41f0-9591-1a319b84c1c5': {
                id: '0fe9d98c-6d46-41f0-9591-1a319b84c1c5',
                type: 'GLTFShape',
                data: {
                  src: 'e6fa9601-3e47-4dff-9a84-e8e017add15a/BirdFountain_01/BirdFountain_01.glb',
                  mappings: {
                    'e6fa9601-3e47-4dff-9a84-e8e017add15a/BirdFountain_01/BirdFountain_01.glb':
                      'QmTxsphQXVqfj9XQWUy6gYy1FgH6wLEp7DXWRCwf2d6KiZ',
                    'e6fa9601-3e47-4dff-9a84-e8e017add15a/BirdFountain_01/file1.png': 'QmYACL8SnbXEonXQeRHdWYbfm8vxvaFAWnsLHUaDG4ABp5'
                  }
                }
              },
              '51ff50bb-8844-4edf-b47c-cd2e1e032655': {
                id: '51ff50bb-8844-4edf-b47c-cd2e1e032655',
                type: 'Transform',
                data: {
                  position: { x: 8, y: 0, z: 7 },
                  rotation: { x: 0, y: 0, z: 0, w: 1 }
                }
              }
            },
            metrics: {
              triangles: 0,
              materials: 0,
              geometries: 0,
              bodies: 0,
              entities: 0,
              textures: 0
            },
            limits: {
              triangles: 10000,
              materials: 20,
              geometries: 200,
              bodies: 300,
              entities: 200,
              textures: 10
            },
            ground: {
              assetId: 'da1fed3c954172146414a66adfa134f7a5e1cb49c902713481bf2fe94180c2cf',
              componentId: '4952786e-d17b-48fe-bd75-a0b0abbd31ee'
            }
          }
        }
      }
    }
  }
}

export const api = new API(API_URL)
