import { renderWithProviders } from 'specs/utils'
import { WorldPermissionNames } from 'lib/api/worlds'
import { Props } from './WorldPermissionsAccessItem.types'
import { WorldPermissionsAccessItem } from './WorldPermissionsAccessItem'
import { WORLD_PERMISSIONS_ACCESS_ITEM_BUTTON_DATA_TEST_ID } from './WorldPermissionsAccessItem'

const renderWorldPermissionsAccessItem = (props: Partial<Props> = {}) =>
  renderWithProviders(<WorldPermissionsAccessItem onUserPermissionListChange={() => undefined} {...props} />)

let isLoading: boolean
let renderedComponent: ReturnType<typeof renderWorldPermissionsAccessItem>

describe('when the component is loading', () => {
  beforeEach(() => {
    isLoading = true
    renderedComponent = renderWorldPermissionsAccessItem({ loading: isLoading })
  })

  it('should render the button as loading and disabled', () => {
    const { getByTestId } = renderedComponent
    const button = getByTestId(WORLD_PERMISSIONS_ACCESS_ITEM_BUTTON_DATA_TEST_ID)
    expect(button).toHaveClass('loading')
    expect(button).toHaveAttribute('disabled')
  })
})

describe('when the component is not loading', () => {
  let onUserPermissionListChange: jest.Mock
  let walletAddress: string

  beforeEach(() => {
    isLoading = false
    onUserPermissionListChange = jest.fn()
    walletAddress = '0x1234'
    renderedComponent = renderWorldPermissionsAccessItem({ loading: isLoading, onUserPermissionListChange, walletAddress })
  })

  it('should render the button as not loading and enabled', () => {
    const { getByTestId } = renderedComponent
    const button = getByTestId(WORLD_PERMISSIONS_ACCESS_ITEM_BUTTON_DATA_TEST_ID)
    expect(button).not.toHaveClass('loading')
    expect(button).not.toHaveAttribute('disabled')
  })

  describe('when clicking the button', () => {
    it('should call the onUserPermissionListChange method prop with the wallet address and the access permission name', () => {
      const { getByTestId } = renderedComponent
      const button = getByTestId(WORLD_PERMISSIONS_ACCESS_ITEM_BUTTON_DATA_TEST_ID)
      button.click()

      expect(onUserPermissionListChange).toHaveBeenCalledWith(expect.anything(), {
        walletAddress,
        worldPermissionName: WorldPermissionNames.Access
      })
    })
  })
})
