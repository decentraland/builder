import { mockTemplate, mockTemplates } from 'specs/project'
import { RootState } from 'modules/common/types'
import { getTemplates } from './selectors'
import { Project, TemplateStatus } from './types'

let state: RootState
let anotherMockTemplate: Project

describe('Templates selectors', () => {
  beforeEach(() => {
    anotherMockTemplate = {
      id: 'templateId2',
      title: 'templateTitle2',
      description: 'templateDescription2',
      thumbnail: 'templateThumbnail2',
      isPublic: true,
      sceneId: 'templateSceneId2',
      ethAddress: '0xb',
      createdAt: '1',
      updatedAt: '1',
      layout: { rows: 3, cols: 4 },
      isTemplate: true,
      video: 'templateVideo2',
      templateStatus: TemplateStatus.PENDING
    }

    state = {
      project: {
        data: {
          ...mockTemplates,
          [anotherMockTemplate.id]: anotherMockTemplate
        }
      }
    } as any
  })

  describe('when getting the templates', () => {
    it('should return the list of availables templates in the state', () => {
      expect(getTemplates(state)).toEqual({ [mockTemplate.id]: mockTemplate, [anotherMockTemplate.id]: anotherMockTemplate })
    })
  })
})
