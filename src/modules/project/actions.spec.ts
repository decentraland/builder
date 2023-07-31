import { mockTemplate, mockTemplates } from 'specs/project'
import {
  loadTemplatesRequest,
  loadTemplatesSuccess,
  loadTemplatesFailure,
  LOAD_TEMPLATES_REQUEST,
  LOAD_TEMPLATES_SUCCESS,
  LOAD_TEMPLATES_FAILURE,
  DUPLICATE_PROJECT_REQUEST,
  DUPLICATE_PROJECT_SUCCESS,
  DUPLICATE_PROJECT_FAILURE,
  duplicateProjectRequest,
  duplicateProjectSuccess,
  duplicateProjectFailure
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

describe('when creating the action to duplicate a project', () => {
  it('should return an action signaling the request to duplicate a project', () => {
    expect(duplicateProjectRequest(mockTemplate)).toEqual({
      type: DUPLICATE_PROJECT_REQUEST,
      payload: { project: mockTemplate, shouldRedirect: true }
    })
  })
})

describe('when creating the action to signal the success of duplicating a project', () => {
  it('should return an action signaling the success of duplicating a project', () => {
    expect(duplicateProjectSuccess(mockTemplate)).toEqual({
      type: DUPLICATE_PROJECT_SUCCESS,
      payload: { project: mockTemplate }
    })
  })
})

describe('when creating the action to signal the failure of duplicating a project', () => {
  it('should return an action signaling the failure of duplicating a project', () => {
    expect(duplicateProjectFailure('error')).toEqual({
      type: DUPLICATE_PROJECT_FAILURE,
      payload: { error: 'error' }
    })
  })
})
