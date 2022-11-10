import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoggedIn } from 'modules/identity/selectors'
import { MapStateProps } from './LikeModal.types'
import LikeModal from './LikeModal'

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state)
})

export default connect(mapState)(LikeModal)
