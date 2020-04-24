import { connect } from 'react-redux'
import { getError } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './MigratePage.types'
import { isLoggedIn } from 'modules/identity/selectors'
import { LEGACY_isLoggedIn, getLoading } from 'modules/auth/selectors'
import { loginRequest } from 'modules/identity/actions'
import { LEGACY_login, MIGRATION_REQUEST, migrationRequest } from 'modules/auth/actions'
import MigratePage from './MigratePage'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isLoggedIn: isLoggedIn(state),
  isLegacyLoggedIn: LEGACY_isLoggedIn(state),
  isMigrating: isLoadingType(getLoading(state), MIGRATION_REQUEST),
  error: getError(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLogin: () => dispatch(loginRequest()),
  onLegacyLogin: () => dispatch(LEGACY_login()),
  onMigrate: () => dispatch(migrationRequest())
})

export default connect(mapState, mapDispatch)(MigratePage)
