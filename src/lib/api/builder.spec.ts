import { AxiosError, AxiosRequestConfig } from 'axios'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { RootStore } from 'modules/common/types'
import { Authorization } from './auth'
import { BuilderAPI } from './builder'

jest.mock('./auth')

const mockUrl = 'https://mock.url.xyz'
const mockAuthorization: Authorization = new Authorization({} as RootStore)
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
