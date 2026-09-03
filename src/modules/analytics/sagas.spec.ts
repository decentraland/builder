import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga/effects'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { fetchApplicationFeaturesFailure, fetchApplicationFeaturesSuccess } from 'decentraland-dapps/dist/modules/features/actions'
import { ApplicationFeatures, ApplicationName } from 'decentraland-dapps/dist/modules/features/types'
import { Project } from 'modules/project/types'
import { deployToWorldSuccess } from 'modules/deployment/actions'
import { Deployment } from 'modules/deployment/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getIsSegmentAltIngestionEnabled } from 'modules/features/selectors'
import { persistSegmentKillSwitch } from './proxy'
import { analyticsSaga, track } from './sagas'

describe('when handling the deploy to world success action', () => {
  let world: string | undefined
  let project: Project | null
  let address: string | undefined

  beforeEach(() => {
    world = 'someworld'
    project = { id: 'someprojectid' } as Project
    address = 'someaddress'
  })

  describe('when the provided deployment does not have a world', () => {
    beforeEach(() => {
      world = undefined
    })

    it('should not call the track function from the analytics service', () => {
      return expectSaga(analyticsSaga)
        .provide([
          [select(getCurrentProject), project],
          [select(getAddress), address]
        ])
        .not.call(track, '[Success] Deploy to World', { project_id: project?.id, eth_address: address, subdomain: world })
        .dispatch(deployToWorldSuccess({ world } as Deployment))
        .silentRun()
    })
  })
  describe('when the current project cannot be found on the store', () => {
    beforeEach(() => {
      project = null
    })

    it('should not call the track function from the analytics service', () => {
      return expectSaga(analyticsSaga)
        .provide([
          [select(getCurrentProject), project],
          [select(getAddress), address]
        ])
        .not.call(track, '[Success] Deploy to World', { project_id: project?.id, eth_address: address, subdomain: world })
        .dispatch(deployToWorldSuccess({ world } as Deployment))
        .silentRun()
    })
  })

  describe('when the address cannot be found on the store', () => {
    beforeEach(() => {
      address = undefined
    })

    it('should not call the track function from the analytics service', () => {
      return expectSaga(analyticsSaga)
        .provide([
          [select(getCurrentProject), project],
          [select(getAddress), address]
        ])
        .not.call(track, '[Success] Deploy to World', { project_id: project?.id, eth_address: address, subdomain: world })
        .dispatch(deployToWorldSuccess({ world } as Deployment))
        .silentRun()
    })
  })

  describe('when the provided deployment has a world, the current project can be found on the store and the address can be found on the store', () => {
    it('should call the track function from the analytics service', () => {
      return expectSaga(analyticsSaga)
        .provide([
          [select(getCurrentProject), project],
          [select(getAddress), address],
          [call(track, '[Success] Deploy to World', { project_id: project?.id, eth_address: address, subdomain: world }), undefined]
        ])
        .dispatch(deployToWorldSuccess({ world } as Deployment))
        .silentRun()
    })
  })
})

describe('when handling the fetch application features success action', () => {
  const features = {} as Record<ApplicationName, ApplicationFeatures>

  describe.each([true, false])('and the segment alt ingestion flag is %s', isEnabled => {
    it('should persist the kill switch value so the next boot honours it', () => {
      return expectSaga(analyticsSaga)
        .provide([
          [select(getIsSegmentAltIngestionEnabled), isEnabled],
          [call(persistSegmentKillSwitch, isEnabled), undefined]
        ])
        .call(persistSegmentKillSwitch, isEnabled)
        .dispatch(fetchApplicationFeaturesSuccess([ApplicationName.DAPPS], features))
        .silentRun()
    })
  })
})

describe('when handling the fetch application features failure action', () => {
  it('should leave the persisted kill switch value alone', () => {
    return expectSaga(analyticsSaga)
      .provide([[select(getIsSegmentAltIngestionEnabled), false]])
      .not.call(persistSegmentKillSwitch, false)
      .dispatch(fetchApplicationFeaturesFailure([ApplicationName.DAPPS], 'anerror'))
      .silentRun()
  })
})
