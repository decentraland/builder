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
    <PublishSceneButton deploymentsByWorlds={{}} ens={ens} projects={[]} onViewScene={jest.fn()} onUnpublishScene={jest.fn()} {...props} />
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

    it('should show the view scene button', () => {
      const screen = renderPublishSceneButton({ projects, deploymentsByWorlds })
      expect(screen.getByRole('button', { name: t('worlds_list_page.table.view_scene') })).toBeInTheDocument()
    })

    describe('when the viewScene button is clicked', () => {
      it('should trigger onViewScene callback action', () => {
        const onViewScene = jest.fn()
        const screen = renderPublishSceneButton({ onViewScene, projects, deploymentsByWorlds })
        const viewSceneButton = screen.getByRole('button', { name: t('worlds_list_page.table.view_scene') })
        userEvent.click(viewSceneButton)
        expect(onViewScene).toHaveBeenCalled()
      })
    })
  })

  describe("and the user doesn't have access to the deployed project", () => {
    beforeEach(() => {
      projects = []
    })

    it('should show the unpublish scene button', () => {
      const screen = renderPublishSceneButton({ projects, deploymentsByWorlds })
      expect(screen.getByRole('button', { name: t('worlds_list_page.table.unpublish_scene') })).toBeInTheDocument()
    })

    describe('when the unpublish button is clicked', () => {
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
