import { expectSaga } from 'redux-saga-test-plan'
import { select } from 'redux-saga/effects'
import { BuilderAPI } from 'lib/api/builder'
import { editProjectThumbnail } from 'modules/project/actions'
import { getData as getProjects } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { saveProjectSuccess } from './actions'
import { syncSaga } from './sagas'
import { saveThumbnail } from './utils'

jest.mock('./utils', () => ({ ...jest.requireActual<object>('./utils'), saveThumbnail: jest.fn() }))

const builderAPI = {} as unknown as BuilderAPI

describe('when handling the saveProjectSuccess action', () => {
  let project: Project

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('and the project has no thumbnail', () => {
    beforeEach(() => {
      project = { id: 'project-id', thumbnail: '' } as Project
    })

    it('should not save a thumbnail belonging to another project', () => {
      return expectSaga(syncSaga, builderAPI)
        .provide([[select(getProjects), { [project.id]: project }]])
        .dispatch(saveProjectSuccess(project))
        .dispatch(editProjectThumbnail('another-project-id', 'data:image/png;base64,other'))
        .run({ silenceTimeout: true })
        .then(() => {
          expect(saveThumbnail).not.toHaveBeenCalled()
        })
    })
  })

  describe('and the project has a thumbnail', () => {
    beforeEach(() => {
      project = { id: 'project-id', thumbnail: 'https://thumbnail.com/thumb.png' } as Project
    })

    it('should save the thumbnail of the project', () => {
      return expectSaga(syncSaga, builderAPI)
        .provide([[select(getProjects), { [project.id]: project }]])
        .dispatch(saveProjectSuccess(project))
        .run({ silenceTimeout: true })
        .then(() => {
          expect(saveThumbnail).toHaveBeenCalledWith(project.id, project, builderAPI)
        })
    })
  })
})
