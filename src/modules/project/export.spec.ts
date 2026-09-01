import { BuilderAPI } from 'lib/api/builder'
import { Project } from 'modules/project/types'
import { SceneSDK7 } from 'modules/scene/types'
import { createSDK7Files, EXPORT_PATH } from './export'

function readAsText(blob: Blob) {
  return new Promise<string>(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsText(blob)
  })
}

describe('when creating the SDK7 files', () => {
  let project: Project
  let scene: SceneSDK7
  let builderAPI: BuilderAPI

  beforeEach(() => {
    project = {
      id: 'project-id',
      title: 'Project',
      thumbnail: 'https://thumbnail.com/thumb.png',
      ethAddress: '0xa',
      layout: { rows: 1, cols: 1 }
    } as Project
    scene = { id: 'scene-id', composite: { version: 1, components: [] }, mappings: {} } as unknown as SceneSDK7
    builderAPI = { fetchCrdt: jest.fn().mockResolvedValue(new Blob(['fetched'])) } as unknown as BuilderAPI
    global.fetch = jest.fn().mockResolvedValue({ blob: () => Promise.resolve(new Blob(['file'])) }) as unknown as typeof fetch
  })

  describe('and a crdt is provided', () => {
    it('should use the provided crdt without fetching it', async () => {
      const files = await createSDK7Files({ project, scene, builderAPI, crdt: new Blob(['provided']) })

      expect(builderAPI.fetchCrdt).not.toHaveBeenCalled()
      expect(await readAsText(files[EXPORT_PATH.MAIN_CRDT_FIE])).toBe('provided')
    })
  })

  describe('and no crdt is provided', () => {
    it('should fetch the crdt from the builder server', async () => {
      const files = await createSDK7Files({ project, scene, builderAPI })

      expect(builderAPI.fetchCrdt).toHaveBeenCalledWith(project.id)
      expect(await readAsText(files[EXPORT_PATH.MAIN_CRDT_FIE])).toBe('fetched')
    })
  })
})
