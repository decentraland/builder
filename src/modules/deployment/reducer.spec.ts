import { fetchWorldDeploymentsRequest, fetchWorldDeploymentsSuccess, fetchWorldDeploymentsFailure } from './actions'
import { deploymentReducer, INITIAL_STATE } from './reducer'
import { Deployment } from './types'

const mockWorlds = ['my-world.dcl.eth', 'my-world2.dcl.eth']

describe('when FETCH_WORLD_DEPLOYMENTS_REQUEST action is dispatched', () => {
  it('should set the loading state', () => {
    const fetchWorldDeploymentsRequestAction = fetchWorldDeploymentsRequest(mockWorlds)
    expect(deploymentReducer(INITIAL_STATE, fetchWorldDeploymentsRequestAction)).toEqual(
      expect.objectContaining({ loading: [fetchWorldDeploymentsRequestAction] })
    )
  })
})

describe('when FETCH_WORLD_DEPLOYMENTS_SUCCESS action is dispatched', () => {
  it('should add new deployments to the state', () => {
    const deployments = [{ id: 'deployMyWorldId' }, { id: 'deployMyWorld2Id' }] as Deployment[]
    const fetchWorldDeploymentsSuccessAction = fetchWorldDeploymentsSuccess(mockWorlds, deployments)
    expect(deploymentReducer(INITIAL_STATE, fetchWorldDeploymentsSuccessAction)).toEqual(
      expect.objectContaining({
        data: {
          deployMyWorldId: { id: 'deployMyWorldId' },
          deployMyWorld2Id: { id: 'deployMyWorld2Id' }
        }
      })
    )
  })
})

describe('when FETCH_WORLD_DEPLOYMENTS_FAILURE action is dispatched', () => {
  it('should set the error state', () => {
    const fetchWorldDeploymentsFailureAction = fetchWorldDeploymentsFailure(mockWorlds, 'error')
    expect(deploymentReducer(INITIAL_STATE, fetchWorldDeploymentsFailureAction)).toEqual(expect.objectContaining({ error: 'error' }))
  })
})
