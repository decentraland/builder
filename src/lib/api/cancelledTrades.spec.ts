import { CancelledTradeReason, CancelledTradesAPI, CancelledTradesResponse, CancelledTradeType } from './cancelledTrades'

let api: CancelledTradesAPI
let fetchSpy: jest.SpyInstance
let response: CancelledTradesResponse

beforeEach(() => {
  response = { data: [], total: 0 }
  api = new CancelledTradesAPI('dcl:builder', 'https://marketplace-api.example.com')
  // BaseClient.fetch is a protected instance property
  fetchSpy = jest.spyOn(api as unknown as { fetch: () => Promise<unknown> }, 'fetch').mockResolvedValueOnce(response)
})

afterEach(() => {
  fetchSpy.mockRestore()
})

describe('when fetching the cancelled trades', () => {
  describe('and the types and the page are given', () => {
    beforeEach(async () => {
      await api.fetchCancelledTrades({
        reason: CancelledTradeReason.CONTRACT_SIGNATURE_INDEX_BUMP,
        types: [CancelledTradeType.PUBLIC_ITEM_ORDER, CancelledTradeType.BID],
        first: 100,
        skip: 200
      })
    })

    it('should request the page of the given reason and types with a signed request', () => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/v1/cancelled-trades?reason=contract_signature_index_bump&first=100&skip=200&type=public_item_order&type=bid',
        { method: 'GET', metadata: { signer: 'dcl:builder' } }
      )
    })
  })

  describe('and neither the types nor the page are given', () => {
    beforeEach(async () => {
      await api.fetchCancelledTrades({ reason: CancelledTradeReason.CONTRACT_SIGNATURE_INDEX_BUMP })
    })

    it('should request the first page of every type', () => {
      expect(fetchSpy).toHaveBeenCalledWith('/v1/cancelled-trades?reason=contract_signature_index_bump&first=100&skip=0', {
        method: 'GET',
        metadata: { signer: 'dcl:builder' }
      })
    })
  })
})
