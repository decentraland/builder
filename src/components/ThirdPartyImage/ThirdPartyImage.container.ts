import { connect } from 'react-redux'
import { ThirdPartyImage } from './ThirdPartyImage'
import { RootState } from 'modules/common/types'
import { getCollection } from 'modules/collection/selectors'
import { MapStateProps, OwnProps } from './ThirdPartyImage.types'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  collection: getCollection(state, ownProps.collectionId)
})

export default connect(mapState)(ThirdPartyImage)
