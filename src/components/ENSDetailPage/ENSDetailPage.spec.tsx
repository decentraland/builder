import { ENS } from 'modules/ens/types'
import { renderWithProviders } from 'specs/utils'
import ENSDetailPage from './ENSDetailPage'
import { Props } from './ENSDetailPage.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getCroppedAddress } from 'components/ENSListPage/utils'
import userEvent from '@testing-library/user-event'

jest.mock('components/LoggedInDetailPage', () => ({ children }: any) => <div>{children}</div>)
function renderENSDetailPage(props: Partial<Props>) {
  return renderWithProviders(
    <ENSDetailPage
      name="test"
      ens={null}
      alias="test"
      avatar={null}
      isLoading={false}
      onOpenModal={jest.fn()}
      onFetchENS={jest.fn()}
      onNavigate={jest.fn()}
      {...props}
    />
  )
}

const ensSample: ENS = {
  name: 'test',
  subdomain: 'test',
  content: '',
  ensOwnerAddress: '0xtest2',
  nftOwnerAddress: '0xtest1',
  resolver: '0xtest3',
  tokenId: '',
  ensAddressRecord: ''
}

describe('when ens is defined', () => {
  let ens: ENS

  describe('and the name is the same as the alias', () => {
    let alias: string
    beforeEach(() => {
      ens = {
        ...ensSample,
        name: 'test'
      }
      alias = 'test'
    })

    it('should show alias info', () => {
      const screen = renderENSDetailPage({ ens, alias })
      expect(screen.getByTestId('alias-avatar')).toBeInTheDocument()
    })
  })

  describe('and the name is not the same as the alias', () => {
    let alias: string
    beforeEach(() => {
      ens = {
        ...ensSample,
        name: 'test'
      }
      alias = 'test2'
    })

    it('should not show alias info', () => {
      const screen = renderENSDetailPage({ ens, alias })
      expect(screen.queryByTestId('alias-avatar')).not.toBeInTheDocument()
    })

    it('should show assigned as alias button', () => {
      const screen = renderENSDetailPage({ ens, alias })
      expect(screen.getByRole('button', { name: t('ens_detail_page.set_as_primary') })).toBeInTheDocument()
    })

    it('should open assign alias modal when button is clicked', () => {
      const openModalMock = jest.fn()
      const screen = renderENSDetailPage({ ens, alias, onOpenModal: openModalMock })
      const assignAliasButton = screen.getByRole('button', { name: t('ens_detail_page.set_as_primary') })
      userEvent.click(assignAliasButton)
      expect(openModalMock).toHaveBeenCalledWith('UseAsAliasModal', { newName: ens.name })
    })
  })

  describe('and there is already an address assigned to the ens', () => {
    let address: string
    beforeEach(() => {
      address = '0xA4f689625F6F51AdF691a64D38772BE85090test'
      ens = {
        ...ensSample,
        ensAddressRecord: address
      }
    })

    it('should show cropped address info', () => {
      const screen = renderENSDetailPage({ ens })
      expect(screen.getByText(getCroppedAddress(address))).toBeInTheDocument()
    })

    it('should show edit address button', () => {
      const screen = renderENSDetailPage({ ens })
      expect(screen.getByRole('button', { name: t('ens_detail_page.edit_address') })).toBeInTheDocument()
    })

    it('should open EnsMapAddressModal when edit button is clicked', () => {
      const openModalMock = jest.fn()
      const screen = renderENSDetailPage({ ens, onOpenModal: openModalMock })
      const editButton = screen.getByRole('button', { name: t('ens_detail_page.edit_address') })
      userEvent.click(editButton)
      expect(openModalMock).toHaveBeenCalledWith('EnsMapAddressModal', { ens })
    })
  })

  describe('and there is no address assigned to the ens', () => {
    beforeEach(() => {
      ens = {
        ...ensSample,
        ensAddressRecord: ''
      }
    })

    it('should show add address button', () => {
      const screen = renderENSDetailPage({ ens })
      expect(screen.getByRole('button', { name: t('ens_list_page.button.link_to_address') })).toBeInTheDocument()
    })

    it('should open EnsMapAddressModal when link button is clicked', () => {
      const openModalMock = jest.fn()
      const screen = renderENSDetailPage({ ens, onOpenModal: openModalMock })
      const linkAddressBtn = screen.getByRole('button', { name: t('ens_list_page.button.link_to_address') })
      userEvent.click(linkAddressBtn)
      expect(openModalMock).toHaveBeenCalledWith('EnsMapAddressModal', { ens })
    })
  })

  describe('and the name has a linked land', () => {
    describe('and the land is a coord', () => {
      beforeEach(() => {
        ens = {
          ...ensSample,
          landId: '4,4'
        }
      })
      it('should the show land field info', () => {
        const screen = renderENSDetailPage({ ens })
        expect(screen.getByTestId('land-field')).toBeInTheDocument()
      })
    })

    describe('and the land is an estate', () => {
      describe('and the land is a coord', () => {
        beforeEach(() => {
          ens = {
            ...ensSample,
            landId: '4'
          }
        })
        it('should show the estate field button', () => {
          const screen = renderENSDetailPage({ ens })
          expect(screen.getByTestId('estate-field')).toBeInTheDocument()
        })
      })
    })
  })

  describe('and the ens does not have a linked land', () => {
    beforeEach(() => {
      ens = {
        ...ensSample,
        landId: ''
      }
    })

    it('should show add address button', () => {
      const screen = renderENSDetailPage({ ens })
      expect(screen.getByRole('button', { name: t('ens_list_page.button.assign_to_land') })).toBeInTheDocument()
    })

    it('should open redirect to ens page when button is clicked', () => {
      const onNavigateMock = jest.fn()
      const screen = renderENSDetailPage({ ens, onNavigate: onNavigateMock })
      const assignLandButton = screen.getByRole('button', { name: t('ens_list_page.button.assign_to_land') })
      userEvent.click(assignLandButton)
      expect(onNavigateMock).toHaveBeenCalledWith('/name/test/set-land')
    })
  })
})
