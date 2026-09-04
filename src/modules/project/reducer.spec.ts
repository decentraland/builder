import { mockTemplate, mockTemplates } from 'specs/project'
import { loadTemplatesFailure, loadTemplatesRequest, loadTemplatesSuccess } from './actions'
import { projectReducer, INITIAL_STATE } from './reducer'

describe('when an action of type LOAD_TEMPLATES_REQUEST is called', () => {
  it('should add a loadTemplatesRequest action to the loading array', () => {
    expect(projectReducer(INITIAL_STATE, loadTemplatesRequest())).toStrictEqual({
      ...INITIAL_STATE,
      loading: [loadTemplatesRequest()]
    })
  })
})

describe('when an action of type LOAD_TEMPLATES_SUCCESS is called', () => {
  it('should add the templates into the project state and remove the loadTemplatesRequest action from the loading array', () => {
    expect(projectReducer(INITIAL_STATE, loadTemplatesSuccess(mockTemplates))).toStrictEqual({
      ...INITIAL_STATE,
      data: {
        ...INITIAL_STATE.data,
        [mockTemplate.id]: mockTemplate
      },
      loading: []
    })
  })
})

describe('when an action of type LOAD_TEMPLATES_FAILURE is called', () => {
  it('should add the error into the project state and remove the loadTemplatesRequest action from the loading array', () => {
    expect(projectReducer(INITIAL_STATE, loadTemplatesFailure('error'))).toStrictEqual({
      ...INITIAL_STATE,
      error: 'error',
      loading: []
    })
  })
})
