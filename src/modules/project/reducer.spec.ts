import { mockTemplate, mockTemplates } from 'specs/project'
import {
  duplicateProjectFailure,
  duplicateProjectRequest,
  duplicateProjectSuccess,
  loadTemplatesFailure,
  loadTemplatesRequest,
  loadTemplatesSuccess
} from './actions'
import { projectReducer, INITIAL_STATE, ProjectState } from './reducer'

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

describe('when an action of type DUPLICATE_PROJECT_REQUEST is called', () => {
  it('should add a duplicateProjectRequest action to the loading array', () => {
    expect(projectReducer(INITIAL_STATE, duplicateProjectRequest(mockTemplate))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [duplicateProjectRequest(mockTemplate)]
    })
  })
})

describe('when an action of type DUPLICATE_PROJECT_SUCCESS is called', () => {
  it('should add the templates into the project state and remove the duplicateProjectRequest action from the loading array', () => {
    const state: ProjectState = {
      data: {
        [mockTemplate.id]: mockTemplate
      },
      loading: [duplicateProjectRequest(mockTemplate)],
      error: 'some error'
    }
    expect(projectReducer(state, duplicateProjectSuccess(mockTemplate))).toStrictEqual({
      data: {
        [mockTemplate.id]: mockTemplate
      },
      loading: [],
      error: null
    })
  })
})

describe('when an action of type DUPLICATE_PROJECT_FAILURE is called', () => {
  it('should add the error into the project state and remove the duplicateProjectRequest action from the loading array', () => {
    expect(projectReducer(INITIAL_STATE, duplicateProjectFailure('error'))).toStrictEqual({
      ...INITIAL_STATE,
      error: 'error',
      loading: []
    })
  })
})
