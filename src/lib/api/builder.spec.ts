import { Authorization } from './auth'
import { BuilderAPI, RemoteCollectionCuration } from './builder'
import { Item } from 'modules/item/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { CurationStatus } from 'modules/curations/types'

jest.mock('./auth')

const mockUrl = 'https://mock.url.xyz'
const mockAuthorization: Authorization = new Authorization(() => 'mockAddress')
const mockBuilder = new BuilderAPI(mockUrl, mockAuthorization)

describe('when making a request to the builder server', () => {
  describe('when sending query parameters on a GET request', () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, data: [] }))
      })
    })

    describe('and the parameters are a URLSearchParams instance', () => {
      it('should append every value to the url', async () => {
        const params = new URLSearchParams()
        params.append('page', '1')
        params.append('limit', '20')
        params.append('tag', 'first')
        params.append('tag', 'second')

        await mockBuilder.request('get', '/collections', { params })

        expect(global.fetch).toHaveBeenCalledWith(`${mockUrl}/collections?page=1&limit=20&tag=first&tag=second`, expect.anything())
      })
    })

    describe('and the parameters are a plain object holding null or undefined', () => {
      it('should omit them from the url', async () => {
        await mockBuilder.request('get', '/items', { params: { page: 1, limit: 20, collectionId: undefined, q: null } })

        expect(global.fetch).toHaveBeenCalledWith(`${mockUrl}/items?page=1&limit=20`, expect.anything())
      })
    })

    describe('and the parameters hold values that are falsy but meaningful', () => {
      it('should keep them, since only null and undefined are dropped', async () => {
        await mockBuilder.request('get', '/collections', { params: { q: '', synced: false, page: 0 } })

        expect(global.fetch).toHaveBeenCalledWith(`${mockUrl}/collections?q=&synced=false&page=0`, expect.anything())
      })
    })

    describe('and a parameter holds an array', () => {
      it('should append one bracketed entry per value', async () => {
        await mockBuilder.request('get', '/collections/id/itemCurations', { params: { itemIds: ['first', 'second'] } })

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockUrl}/collections/id/itemCurations?itemIds%5B%5D=first&itemIds%5B%5D=second`,
          expect.anything()
        )
      })
    })
  })

  describe('when the server responds with an error', () => {
    const responseBody = { ok: false, data: { id: 'id-with-error' }, error: 'Name already in use' }

    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 409,
        text: () => Promise.resolve(JSON.stringify(responseBody))
      })
    })

    it('should reject with the response error as the message, keeping the status and payload', async () => {
      await expect(mockBuilder.request('get', '/')).rejects.toMatchObject({
        message: 'Name already in use',
        code: '409',
        response: { status: 409, data: responseBody }
      })
    })
  })
})

describe('when saving item contents', () => {
  let item: Item
  let contents: Record<string, Blob>

  beforeEach(() => {
    contents = {
      file1: new Blob(),
      file2: new Blob()
    }
    item = {
      id: 'id',
      name: 'name',
      contents
    } as unknown as Item

    jest.spyOn(BuilderAPI.prototype, 'request').mockResolvedValue(undefined)
  })

  describe('when there are no videos in the content to be sent', () => {
    it('should store the response data error inside the error message', async () => {
      await mockBuilder.saveItemContents(item, contents)
      expect(BuilderAPI.prototype.request).toHaveBeenCalledWith('post', `/items/${item.id}/files`, { params: expect.any(FormData) })
    })
  })

  describe('when the item also has a preview video', () => {
    beforeEach(() => {
      contents = {
        ...contents,
        video: { type: 'video/mp4', size: 1000, name: 'preview.mp4' } as unknown as Blob
      }
      item = {
        ...item,
        contents
      } as unknown as Item
      jest.spyOn(BuilderAPI.prototype, 'request').mockResolvedValue(undefined)
    })

    it('should store the response data error inside the error message', async () => {
      await mockBuilder.saveItemContents(item, contents)
      expect(BuilderAPI.prototype.request).toHaveBeenCalledWith('post', `/items/${item.id}/files`, { params: expect.any(FormData) })
      expect(BuilderAPI.prototype.request).toHaveBeenCalledWith('post', `/items/${item.id}/videos`, { params: expect.any(FormData) })
    })
  })
})

describe('when working with collection curations', () => {
  const remoteCuration: RemoteCollectionCuration = {
    id: 'curation-id',
    collection_id: 'collection-id',
    assignee: '0xassignee',
    status: CurationStatus.PENDING,
    created_at: new Date(100),
    updated_at: new Date(200)
  }
  const expectedCuration: CollectionCuration = {
    id: 'curation-id',
    collectionId: 'collection-id',
    assignee: '0xassignee',
    status: CurationStatus.PENDING,
    createdAt: 100,
    updatedAt: 200
  }

  beforeEach(() => {
    jest.spyOn(BuilderAPI.prototype, 'request').mockResolvedValue(remoteCuration)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when pushing a curation', () => {
    it('should return the curation with its properties mapped from the server response', async () => {
      await expect(mockBuilder.pushCuration('collection-id', '0xassignee')).resolves.toEqual(expectedCuration)
    })
  })

  describe('when updating a curation', () => {
    it('should return the curation with its properties mapped from the server response', async () => {
      await expect(mockBuilder.updateCuration('collection-id', { assignee: '0xassignee' })).resolves.toEqual(expectedCuration)
    })
  })
})
