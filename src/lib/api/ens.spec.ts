import { ENSApi } from './ens'

describe('when fetching the external names for an owner', () => {
  let owner: string

  beforeEach(() => {
    owner = '0x123'
  })

  describe('when the ens api is instanced with a subgraph url', () => {
    let subgraphUrl: string
    let ensApi: ENSApi

    beforeEach(() => {
      subgraphUrl = 'https://ens-subgraph.com'
      ensApi = new ENSApi(subgraphUrl)
    })

    describe('when the fetch request fails', () => {
      beforeEach(() => {
        jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Some Error'))
      })

      it('should throw an error containing the error of the fetch request', async () => {
        await expect(ensApi.fetchExternalNames(owner)).rejects.toThrowError('Failed to fetch ENS list - Some Error')
      })
    })

    describe('when the fetch response is not ok', () => {
      beforeEach(() => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: false, status: 500 } as any)
      })

      it('should throw an error containing the status code of the failed response', async () => {
        await expect(ensApi.fetchExternalNames(owner)).rejects.toThrowError('Failed to fetch ENS list - 500')
      })
    })

    describe('when the query result has an errors property', () => {
      beforeEach(() => {
        jest
          .spyOn(global, 'fetch')
          .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ errors: [{ message: 'Some Error' }] }) } as any)
      })

      it('should throw an error containing the stringified errors property value', async () => {
        await expect(ensApi.fetchExternalNames(owner)).rejects.toThrowError('Failed to fetch ENS list - [{"message":"Some Error"}]')
      })
    })

    describe('when the query result has a data property', () => {
      let mockFetch: jest.SpyInstance

      beforeEach(() => {
        mockFetch = jest
          .spyOn(global, 'fetch')
          .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: { domains: [{ name: 'some-name.eth' }] } }) } as any)
      })

      it('should return an array of external names', async () => {
        await expect(ensApi.fetchExternalNames(owner)).resolves.toEqual(['some-name.eth'])
      })

      it('should add the provided owner to the fetch request', async () => {
        await ensApi.fetchExternalNames(owner)

        expect(mockFetch).toHaveBeenCalledWith(subgraphUrl, expect.objectContaining({ body: expect.stringContaining(owner) }))
      })
    })
  })
})
