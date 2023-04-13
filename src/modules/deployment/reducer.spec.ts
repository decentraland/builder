import { deployToWorldFailure, deployToWorldRequest, deployToWorldSuccess } from './actions'
import { deploymentReducer, INITIAL_STATE } from './reducer'
import { Deployment, ProgressStage } from './types'

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
