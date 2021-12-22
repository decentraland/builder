import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getBaseWearables } from 'modules/editor/selectors'
import { MapStateProps } from './AvatarWearableDropdown.types'
import AvatarWearableDropdown from './AvatarWearableDropdown'

const mapState = (state: RootState): MapStateProps => {
  return {
    baseWearables: getBaseWearables(state)
  }
}

export default connect(mapState)(AvatarWearableDropdown)
