import { AxiosError, AxiosRequestConfig } from 'axios'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { Authorization } from './auth'
import { BuilderAPI } from './builder'
import { Item } from 'modules/item/types'

jest.mock('./auth')

const mockUrl = 'https://mock.url.xyz'
const mockAuthorization: Authorization = new Authorization(() => 'mockAddress')
const mockBuilder = new BuilderAPI(mockUrl, mockAuthorization)

describe('when making a request to the builder server', () => {
  describe('when the request fails', () => {
    describe('and the error is an Axios Error', () => {
      let error: AxiosError

      beforeEach(() => {
        error = {
          name: 'Axios Error',
          message: 'Error Message',
          config: {} as AxiosRequestConfig,
          code: '409',
          response: {
            data: { id: 'id-with-error', error: 'Name already in use' },
            status: 409,
            statusText: 'Conflict',
            headers: {},
            config: {}
          },
          isAxiosError: true,
          toJSON: jest.fn()
        }
        jest.spyOn(BaseAPI.prototype, 'request').mockRejectedValue(error)
      })

      it('should store the response data error inside the error message', async () => {
        return expect(mockBuilder.request('GET', '/')).rejects.toEqual({ ...error, message: error.response?.data.error })
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
