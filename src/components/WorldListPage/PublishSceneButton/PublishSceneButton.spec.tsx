import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { t } from 'decentraland-dapps/dist/modules/translation'
import { ENS } from 'modules/ens/types'
import { Deployment } from 'modules/deployment/types'
import { Project } from 'modules/project/types'
import { Props } from './PublishSceneButton.types'
import PublishSceneButton from './PublishSceneButton'

const ens = {
  name: 'test',
  subdomain: 'test',
  content: '',
  ensOwnerAddress: '0xtest1',
  nftOwnerAddress: '0xtest1',
  resolver: '0xtest3',
  tokenId: '',
  ensAddressRecord: '',
  worldStatus: {
    healthy: true
  }
} as ENS

let deploymentsByWorlds: Record<string, Deployment>
let projects: Project[]

function renderPublishSceneButton(props: Partial<Props>) {
  return render(
    <PublishSceneButton
      deploymentsByWorlds={{}}
      ens={ens}
      projects={[]}
      onEditScene={jest.fn()}
      onPublishScene={jest.fn()}
      onUnpublishScene={jest.fn()}
      {...props}
    />
  )
}

describe('when the world has a scene deployed', () => {
  beforeEach(() => {
    deploymentsByWorlds = {
      [ens.subdomain]: {
        projectId: '1',
        name: 'Deployment'
      } as Deployment
    }
  })

  describe('and the user has access to the deployed project', () => {
    beforeEach(() => {
      projects = [{ id: '1' } as Project]
    })

    it('should show edit scene button', () => {
      const screen = renderPublishSceneButton({ projects, deploymentsByWorlds })
      expect(screen.getByRole('button', { name: t('worlds_list_page.table.edit_scene') })).toBeInTheDocument()
    })

    describe('when editScene button is clicked', () => {
      it('should trigger onEditScene callback action', () => {
        const onEditScene = jest.fn()
        const screen = renderPublishSceneButton({ onEditScene, projects, deploymentsByWorlds })
        const editSceneButton = screen.getByRole('button', { name: t('worlds_list_page.table.edit_scene') })
        userEvent.click(editSceneButton)
        expect(onEditScene).toHaveBeenCalled()
      })
    })
  })

  describe("and the user doesn't have access to the deployed project", () => {
    beforeEach(() => {
      projects = []
    })

    it('should show unpublish scene button', () => {
      const screen = renderPublishSceneButton({ projects, deploymentsByWorlds })
      expect(screen.getByRole('button', { name: t('worlds_list_page.table.unpublish_scene') })).toBeInTheDocument()
    })

    describe('when unpublish button is clicked', () => {
      it('should trigger onUnpublish callback action', () => {
        const onUnpublishScene = jest.fn()
        const screen = renderPublishSceneButton({ onUnpublishScene, projects, deploymentsByWorlds })
        const unpublishSceneButton = screen.getByRole('button', { name: t('worlds_list_page.table.unpublish_scene') })
        userEvent.click(unpublishSceneButton)
        expect(onUnpublishScene).toHaveBeenCalled()
      })
    })
  })
})

describe('when the world has no scene deployed', () => {
  it('should show publish scene button', () => {
    const screen = renderPublishSceneButton({})
    expect(screen.getByRole('button', { name: t('worlds_list_page.table.publish_scene') })).toBeInTheDocument()
  })

  describe('when publish button is clicked', () => {
    it('should trigger onPublish callback action', () => {
      const onPublishScene = jest.fn()
      const screen = renderPublishSceneButton({ onPublishScene })
      const publishButton = screen.getByRole('button', { name: t('worlds_list_page.table.publish_scene') })
      userEvent.click(publishButton)
      expect(onPublishScene).toHaveBeenCalled()
    })
  })
})
