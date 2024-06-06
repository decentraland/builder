import { connect } from 'react-redux'
import { getIsWorldContributorEnabled } from 'modules/features/selectors'
import { RootState } from 'modules/common/types'
import NameTabs from './NameTabs'

const mapState = (state: RootState) => {
  return {
    isWorldContributorEnabled: getIsWorldContributorEnabled(state)
  }
}

export default connect(mapState)(NameTabs)
