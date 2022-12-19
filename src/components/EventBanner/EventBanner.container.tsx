import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getIsCampaignEnabled } from '../../modules/features/selectors'
import { MapStateProps } from './EventBanner.types'
import EventBanner from './EventBanner'

const mapState = (state: RootState): MapStateProps => ({
  isCampaignEnabled: getIsCampaignEnabled(state)
})

export default connect(mapState, {})(EventBanner)
