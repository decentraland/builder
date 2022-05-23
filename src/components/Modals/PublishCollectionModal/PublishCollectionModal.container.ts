import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps } from './PublishCollectionModal.types'
import PublishCollectionModal from './PublishCollectionModal'
import { getIsRaritiesWithOracleEnabled } from 'modules/features/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isRaritiesWithOracleEnabled: getIsRaritiesWithOracleEnabled(state)
})

export default connect(mapState)(PublishCollectionModal)
