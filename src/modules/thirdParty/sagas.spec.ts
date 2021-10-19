import { call } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import { fetchThirdPartiesRequest, fetchThirdPartiesFailure, fetchThirdPartiesSuccess } from './actions'
import { thirdPartySaga } from './sagas'
import { ThirdParty } from './types'

const mockBuilder = ({ fetchThirdParties: jest.fn() } as any) as BuilderAPI

afterEach(() => {
  jest.clearAllMocks()
})

describe('when fetching third parties', () => {
  describe('when the api request fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'Some Error Message'
    })

    it('should put the fetch third party fail action with an error', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([[call(mockBuilder.fetchThirdParties, undefined), throwError(new Error(errorMessage))]])
        .put(fetchThirdPartiesFailure(errorMessage))
        .dispatch(fetchThirdPartiesRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    let thirdParties: ThirdParty[]

    beforeEach(() => {
      thirdParties = [
        { id: '1', name: 'a third party', description: 'some desc', managers: ['0x1', '0x2'] },
        { id: '2', name: 'a third party', description: 'some desc', managers: ['0x3'] }
      ]
    })

    describe('when an address is supplied in the action payload', () => {
      let address: string

      beforeEach(() => {
        address = '0x1'
      })

      it('should pass the address to the api and put the fetch third party success action the response', () => {
        return expectSaga(thirdPartySaga, mockBuilder)
          .provide([[call(mockBuilder.fetchThirdParties, address), thirdParties]])
          .put(fetchThirdPartiesSuccess(thirdParties))
          .dispatch(fetchThirdPartiesRequest(address))
          .run({ silenceTimeout: true })
      })
    })

    describe('when no address is supplied', () => {
      it('should put the fetch third party success action the api response', () => {
        return expectSaga(thirdPartySaga, mockBuilder)
          .provide([[call(mockBuilder.fetchThirdParties, undefined), thirdParties]])
          .put(fetchThirdPartiesSuccess(thirdParties))
          .dispatch(fetchThirdPartiesRequest())
          .run({ silenceTimeout: true })
      })
    })
  })
})
