import { mockTemplates } from 'specs/project'
import {
  loadTemplatesRequest,
  loadTemplatesSuccess,
  loadTemplatesFailure,
  LOAD_TEMPLATES_REQUEST,
  LOAD_TEMPLATES_SUCCESS,
  LOAD_TEMPLATES_FAILURE
} from './actions'

describe('when creating the action to request the scene templates', () => {
  it('should return an action signaling the request to load the scene templates', () => {
    expect(loadTemplatesRequest()).toEqual({
      type: LOAD_TEMPLATES_REQUEST,
      payload: {}
    })
  })
})

describe('when creating the action to signal the success of loading the scene templates', () => {
  it('should return an action signaling the success of loading the scene templates', () => {
    expect(loadTemplatesSuccess(mockTemplates)).toEqual({
      type: LOAD_TEMPLATES_SUCCESS,
      payload: { projects: mockTemplates }
    })
  })
})

describe('when creating the action to signal the failure of loading the scene templates', () => {
  it('should return an action signaling the failure of loading the scene templates', () => {
    expect(loadTemplatesFailure('error')).toEqual({
      type: LOAD_TEMPLATES_FAILURE,
      payload: { error: 'error' }
    })
  })
})
