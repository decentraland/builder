import { Authorization } from './auth'
import { BuilderAPI } from './builder'
import { Item } from 'modules/item/types'

jest.mock('./auth')

const mockUrl = 'https://mock.url.xyz'
const mockAuthorization: Authorization = new Authorization(() => 'mockAddress')
const mockBuilder = new BuilderAPI(mockUrl, mockAuthorization)

describe('when making a request to the builder server', () => {
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
