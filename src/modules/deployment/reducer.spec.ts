import {
  deployToWorldFailure,
  deployToWorldRequest,
  deployToWorldSuccess,
  fetchWorldDeploymentsRequest,
  fetchWorldDeploymentsSuccess,
  fetchWorldDeploymentsFailure
} from './actions'
import { deploymentReducer, INITIAL_STATE } from './reducer'
import { Deployment, ProgressStage } from './types'

const mockWorlds = ['my-world.dcl.eth', 'my-world2.dcl.eth']

describe('when DEPLOY_TO_WORLD_REQUEST action is dispatched', () => {
  it('should add loading to deploy to world', () => {
    const deployToWorldRequestAction = deployToWorldRequest('1', 'my-world')
    expect(deploymentReducer(INITIAL_STATE, deployToWorldRequestAction)).toEqual(
      expect.objectContaining({ loading: [deployToWorldRequestAction] })
    )
  })

  it('should set error as null', () => {
    const deployToWorldRequestAction = deployToWorldRequest('1', 'my-world')
    expect(deploymentReducer(INITIAL_STATE, deployToWorldRequestAction)).toEqual(expect.objectContaining({ error: null }))
  })
})

describe('when DEPLOY_TO_WORLD_SUCCESS action is dispatched', () => {
  it('should remove loading to deploy to world', () => {
    const deployToWorldSuccessAction = deployToWorldSuccess({} as Deployment)
    expect(deploymentReducer(INITIAL_STATE, deployToWorldSuccessAction)).toEqual(expect.objectContaining({ loading: [] }))
  })

  it('should reset progress', () => {
    const deployToWorldSuccessAction = deployToWorldSuccess({} as Deployment)
    expect(
      deploymentReducer(
        {
          ...INITIAL_STATE,
          progress: { stage: ProgressStage.CREATE_FILES, value: 1 }
        },
        deployToWorldSuccessAction
      )
    ).toEqual(
      expect.objectContaining({
        progress: {
          stage: ProgressStage.NONE,
          value: 0
        }
      })
    )
  })

  it('should add new deployment to the state', () => {
    const deployToWorldSuccessAction = deployToWorldSuccess({ id: 'deployId' } as Deployment)
    expect(deploymentReducer(INITIAL_STATE, deployToWorldSuccessAction)).toEqual(
      expect.objectContaining({
        data: {
          deployId: { id: 'deployId' }
        }
      })
    )
  })
})

describe('when DEPLOY_TO_WORLD_FAILURE action is dispatched', () => {
  it('should remove loading to deploy to world', () => {
    const deployToWorldFailureAction = deployToWorldFailure('error')
    expect(deploymentReducer(INITIAL_STATE, deployToWorldFailureAction)).toEqual(expect.objectContaining({ loading: [] }))
  })

  it('should add error to the state', () => {
    const deployToWorldFailureAction = deployToWorldFailure('error')
    expect(deploymentReducer(INITIAL_STATE, deployToWorldFailureAction)).toEqual(expect.objectContaining({ error: 'error' }))
  })
})

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
