import { ContractNetwork } from '@dcl/schemas'
import { render } from '@testing-library/react'
import { NETWORK_ICON_DATA_TEST_ID } from 'components/NetworkIcon'
import { Collection } from 'modules/collection/types'
import { COLLECTION_IMAGE_DATA_TEST_ID } from 'components/CollectionImage'
import { ThirdPartyImage } from './ThirdPartyImage'
import { Props } from './ThirdPartyImage.types'

jest.mock('components/CollectionImage/CollectionImage.container', () => () => <div data-testid={COLLECTION_IMAGE_DATA_TEST_ID} />)

const renderThirdPartyImage = (props: Partial<Props> = {}) =>
  render(<ThirdPartyImage collection={{ id: 'aCollectionId' } as Collection} collectionId="aCollectionId" {...props} />)

describe('when rendering the component', () => {
  let props: Partial<Props>
  let renderedComponent: ReturnType<typeof renderThirdPartyImage>

  beforeEach(() => {
    props = {}
  })

  describe('without a contract network', () => {
    beforeEach(() => {
      props.collection = { id: 'aCollectionId', linkedContractNetwork: undefined } as Collection
      renderedComponent = renderThirdPartyImage(props)
    })

    it('should not render the network image', () => {
      expect(renderedComponent.queryByTestId(NETWORK_ICON_DATA_TEST_ID)).not.toBeInTheDocument()
    })
  })

  describe('with a contract network', () => {
    beforeEach(() => {
      props.collection = { id: 'aCollectionId', linkedContractNetwork: ContractNetwork.MAINNET } as Collection
      renderedComponent = renderThirdPartyImage(props)
    })

    it('should render the network image', () => {
      expect(renderedComponent.getByTestId(NETWORK_ICON_DATA_TEST_ID)).toBeInTheDocument()
    })
  })

  describe('with an item count as zero', () => {
    beforeEach(() => {
      props.collection = { id: 'aCollectionId', itemCount: 0 } as Collection
      renderedComponent = renderThirdPartyImage(props)
    })

    it('should not render a collection image', () => {
      expect(renderedComponent.queryByTestId(COLLECTION_IMAGE_DATA_TEST_ID)).not.toBeInTheDocument()
    })
  })

  describe('with an item count greater than zero', () => {
    beforeEach(() => {
      props.collection = { id: 'aCollectionId', itemCount: 1 } as Collection
      renderedComponent = renderThirdPartyImage(props)
    })

    it('should render a collection image', () => {
      expect(renderedComponent.getByTestId(COLLECTION_IMAGE_DATA_TEST_ID)).toBeInTheDocument()
    })
  })
})
