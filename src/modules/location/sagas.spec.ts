import { race, select, take } from '@redux-saga/core/effects'
import { getLocation, push } from 'connected-react-router'
import { expectSaga } from 'redux-saga-test-plan'
import {
  fetchCollectionsFailure,
  fetchCollectionsSuccess,
  FETCH_COLLECTIONS_FAILURE,
  FETCH_COLLECTIONS_SUCCESS
} from 'modules/collection/actions'
import { getCollectionsByContractAddress } from 'modules/collection/selectors'
import { locations } from 'routing/locations'
import { redirectToFailure, redirectToRequest, redirectToSuccess } from './actions'
import { handleLocationChange, handleRedirectToRequest } from './sagas'

describe('when handling location change', () => {
  describe('when redirectTo is present in the query', () => {
    it('should put a redirect to request action', () => {
      const redirectTo = 'redirect to'

      return expectSaga(handleLocationChange)
        .provide([[select(getLocation), { query: { redirectTo } }]])
        .put(redirectToRequest(redirectTo))
        .silentRun()
    })
  })
})

describe('when handling redirect', () => {
  describe('when redirectTo cannot be parsed', () => {
    it('should put redirect to failure parsing failure with message', () => {
      const encoded = 'cannot parse this'

      return expectSaga(handleRedirectToRequest, redirectToRequest(encoded))
        .put(redirectToFailure(encoded, 'Unexpected token c in JSON at position 0'))
        .silentRun()
    })
  })

  describe('when redirectTo type is invalid', () => {
    it('should put redirect to failure with invalid type message', () => {
      const encoded = '%7B%22type%22%3A%22invalid%20type%22%7D'

      return expectSaga(handleRedirectToRequest, redirectToRequest(encoded))
        .put(redirectToFailure(encoded, 'Invalid redirect to type "invalid type"'))
        .silentRun()
    })
  })

  describe('when redirectTo is COLLECTION_DETAIL_BY_CONTRACT_ADDRESS', () => {
    const contractAddress = '0xbcf5784c4cfa38ba49253527e80c9e9510e01c67'
    const encoded = `%7B"type"%3A"COLLECTION_DETAIL_BY_CONTRACT_ADDRESS"%2C"data"%3A%7B"contractAddress"%3A"${contractAddress}"%7D%7D`

    describe('when fetch collections fails', () => {
      it('should put redirect to failure with collections could not be fetched message', () => {
        const error = 'some error'

        return expectSaga(handleRedirectToRequest, redirectToRequest(encoded))
          .provide([
            [
              race({ success: take(FETCH_COLLECTIONS_SUCCESS), failure: take(FETCH_COLLECTIONS_FAILURE) }),
              { failure: fetchCollectionsFailure(error) }
            ]
          ])
          .put(redirectToFailure(encoded, `Could not get collections. ${error}`))
          .silentRun()
      })
    })

    describe('when fetch collections succeeds', () => {
      describe('when the collection does not exist in the store', () => {
        it('should put redirect to failure with collection not found message', () => {
          return expectSaga(handleRedirectToRequest, redirectToRequest(encoded))
            .provide([
              [
                race({ success: take(FETCH_COLLECTIONS_SUCCESS), failure: take(FETCH_COLLECTIONS_FAILURE) }),
                { success: fetchCollectionsSuccess([]) }
              ],
              [select(getCollectionsByContractAddress), {}]
            ])
            .put(redirectToFailure(encoded, `Collection with contract address ${contractAddress} not found`))
            .silentRun()
        })
      })

      describe('when the collection exists in the store', () => {
        it('should put redirect to success and push collection detail location', () => {
          const collectionId = 'some id'

          return expectSaga(handleRedirectToRequest, redirectToRequest(encoded))
            .provide([
              [
                race({ success: take(FETCH_COLLECTIONS_SUCCESS), failure: take(FETCH_COLLECTIONS_FAILURE) }),
                { success: fetchCollectionsSuccess([]) }
              ],
              [select(getCollectionsByContractAddress), { [contractAddress]: { id: collectionId } }]
            ])
            .put(redirectToSuccess(encoded))
            .put(push(locations.collectionDetail(collectionId)))
            .silentRun()
        })
      })
    })
  })
})
