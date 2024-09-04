import { ContractNetwork } from '@dcl/schemas'
import { render } from '@testing-library/react'
import { NETWORK_ICON_DATA_TEST_ID } from 'components/NetworkIcon'
import { ThirdPartyImage } from './ThirdPartyImage'
import { Props } from './ThirdPartyImage.types'

const renderThirdPartyImage = (props: Partial<Props> = {}) => render(<ThirdPartyImage thirdPartyId="aThirdPartyId" {...props} />)

describe('when rendering the component', () => {
  let props: Partial<Props>
  let renderedComponent: ReturnType<typeof renderThirdPartyImage>

  beforeEach(() => {
    props = {}
  })

  describe('without a contract network', () => {
    beforeEach(() => {
      props.network = undefined
      renderedComponent = renderThirdPartyImage(props)
    })

    it('should not render the network image', () => {
      expect(renderedComponent.queryByTestId(NETWORK_ICON_DATA_TEST_ID)).not.toBeInTheDocument()
    })
  })

  describe('with a contract network', () => {
    beforeEach(() => {
      props.network = ContractNetwork.MAINNET
      renderedComponent = renderThirdPartyImage(props)
    })

    it('should render the network image', () => {
      expect(renderedComponent.getByTestId(NETWORK_ICON_DATA_TEST_ID)).toBeInTheDocument()
    })
  })
})
