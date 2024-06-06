import { t } from 'decentraland-dapps/dist/modules/translation'
import { renderWithProviders } from 'specs/utils'
import { Deployment } from 'modules/deployment/types'
import { ENS } from 'modules/ens/types'
import { fromBytesToMegabytes, getExplorerUrl } from '../utils'
import WorldContributorTab from './WorldContributorTab'
import { Props } from './WorldContributorTab.types'
import userEvent from '@testing-library/user-event'

export function renderWorldContributorTab(props: Partial<Props>) {
  return renderWithProviders(
    <WorldContributorTab
      items={[]}
      deploymentsByWorlds={{}}
      error={null}
      loading={false}
      onUnpublishWorld={jest.fn()}
      projects={[]}
      {...props}
    />
  )
}

describe('when loading the items', () => {
  it('should show spinner', () => {
    const screen = renderWorldContributorTab({ loading: true })
    expect(screen.container.getElementsByClassName('loader').length).toBe(1)
  })
})

describe('when rendering contributable names table', () => {
  let deploymentsByWorlds: Record<string, Deployment>
  let items: ENS[]

  describe('when the user has no contributable names', () => {
    beforeEach(() => {
      items = []
    })

    it('should show empty placeholder', () => {
      const screen = renderWorldContributorTab({ items })
      expect(screen.getByText(t('worlds_list_page.empty_contributor_list.title')))
    })
  })

  describe('when the user has contributable names', () => {
    beforeEach(() => {
      items = [
        {
          name: 'test.dcl.eth',
          subdomain: 'test.dcl.eth',
          content: '',
          ensOwnerAddress: '0xtest1',
          nftOwnerAddress: '0xtest1',
          resolver: '0xtest3',
          tokenId: '',
          ensAddressRecord: '',
          size: '1048576',
          userPermissions: ['deployment'],
          worldStatus: {
            healthy: true,
            scene: { urn: 'urn', entityId: 'entityId' }
          }
        }
      ]
    })

    it("should show item's name", () => {
      const screen = renderWorldContributorTab({ items })
      expect(screen.getByText(items[0].name)).toBeInTheDocument()
    })

    it("should show item's size", () => {
      const screen = renderWorldContributorTab({ items })
      expect(screen.getByText(fromBytesToMegabytes(Number(items[0].size!)))).toBeInTheDocument()
    })

    it("should show item's permissions", () => {
      const screen = renderWorldContributorTab({ items })
      expect(screen.getByText(t(`worlds_list_page.table.user_permissions.${items[0].userPermissions![0]}`))).toBeInTheDocument()
    })

    describe('when the world has a scene deployed', () => {
      beforeEach(() => {
        deploymentsByWorlds = {
          ['test.dcl.eth']: {
            projectId: '1',
            id: '1'
          } as Deployment
        }
      })

      it("should show world's url", () => {
        const screen = renderWorldContributorTab({ items, deploymentsByWorlds })
        expect(screen.getByText(getExplorerUrl(items[0].subdomain)))
      })

      describe('and the user has deployment permissions', () => {
        beforeEach(() => {
          items = [
            {
              ...items[0],
              userPermissions: ['deployment']
            }
          ]
        })

        it('should show unpublish scene button', () => {
          const screen = renderWorldContributorTab({ items, deploymentsByWorlds })
          expect(screen.getByRole('button', { name: t('worlds_list_page.table.unpublish_scene') })).toBeInTheDocument()
        })

        it('should trigger onUnpublishWorld action when unpublish button is clicked', () => {
          const onUnpublishWorld = jest.fn()
          const screen = renderWorldContributorTab({ items, deploymentsByWorlds, onUnpublishWorld })
          const unpublishBtn = screen.getByRole('button', { name: t('worlds_list_page.table.unpublish_scene') })
          userEvent.click(unpublishBtn)
          expect(onUnpublishWorld).toHaveBeenCalled()
        })
      })

      describe("and the user doesn't have deployment permissions", () => {
        beforeEach(() => {
          items = [
            {
              ...items[0],
              userPermissions: ['streaming']
            }
          ]
        })

        it('should not show unpublish scene button', () => {
          const screen = renderWorldContributorTab({ items, deploymentsByWorlds })
          expect(screen.queryByRole('button', { name: t('worlds_list_page.table.unpublish_scene') })).not.toBeInTheDocument()
        })
      })
    })

    describe('when the world has no scene deployed', () => {
      beforeEach(() => {
        deploymentsByWorlds = {}
      })

      describe('and the user has deployment permissions', () => {
        beforeEach(() => {
          items = [
            {
              ...items[0],
              userPermissions: ['deployment']
            }
          ]
        })

        it('should show publish scene button', () => {
          const screen = renderWorldContributorTab({ items, deploymentsByWorlds })
          expect(screen.getByRole('button', { name: t('worlds_list_page.table.publish_scene') })).toBeInTheDocument()
        })
      })

      describe("and the user doesn't have deployment permissions", () => {
        beforeEach(() => {
          items = [
            {
              ...items[0],
              userPermissions: ['streaming']
            }
          ]
        })

        it('should not show publish scene button', () => {
          const screen = renderWorldContributorTab({ items, deploymentsByWorlds })
          expect(screen.queryByRole('button', { name: t('worlds_list_page.table.publish_scene') })).not.toBeInTheDocument()
        })
      })
    })
  })
})
