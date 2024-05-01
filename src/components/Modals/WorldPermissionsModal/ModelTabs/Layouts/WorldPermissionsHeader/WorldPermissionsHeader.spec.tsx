import { render } from '@testing-library/react'
import { Props } from './WorldPermissionsHeader.types'
import { WORLD_PERMISSIONS_HEADER_TEXT_DATA_TEST_ID, WorldPermissionsHeader } from './WorldPermissionsHeader'

const renderWorldPermissionsHeader = (props: Partial<Props> = {}) => {
  return render(<WorldPermissionsHeader loading={false} description={'defaultDescription'} {...props} />)
}

describe('when rendering the Worlds Permissions Header', () => {
  let renderedComponent: ReturnType<typeof renderWorldPermissionsHeader>

  describe("when it's loading", () => {
    beforeEach(() => {
      renderedComponent = renderWorldPermissionsHeader({ loading: true })
    })

    it('should not render the description', () => {
      const { queryByTestId } = renderedComponent
      expect(queryByTestId(WORLD_PERMISSIONS_HEADER_TEXT_DATA_TEST_ID)).not.toBeInTheDocument()
    })
  })

  describe("when it's not loading", () => {
    let description: string

    beforeEach(() => {
      description = 'a description'
      renderedComponent = renderWorldPermissionsHeader({ loading: false, description })
    })

    it('should render the description', () => {
      const { getByTestId } = renderedComponent
      const descriptionComponent = getByTestId(WORLD_PERMISSIONS_HEADER_TEXT_DATA_TEST_ID)
      expect(descriptionComponent).toBeInTheDocument()
      expect(descriptionComponent.textContent).toBe(description)
    })
  })
})
