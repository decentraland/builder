import { connect } from 'react-redux'
import { push, goBack, getLocation, replace } from 'connected-react-router'
import { getData as getWallet, getMana } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { openModal } from 'modules/modal/actions'
import { RootState } from 'modules/common/types'
import { hasHistory } from 'modules/location/selectors'
import { DeployToWorldLocationStateProps, FromParam } from 'modules/location/types'
import { MapDispatchProps, MapDispatch, MapStateProps } from './ClaimENSPage.types'
import ClaimENSPage from './ClaimENSPage'

const mapState = (state: RootState): MapStateProps => {
  const isFromDeployToWorld = (getLocation(state).state as DeployToWorldLocationStateProps)?.fromParam === FromParam.DEPLOY_TO_WORLD
  let projectId = null
  if (isFromDeployToWorld) {
    projectId = (getLocation(state).state as DeployToWorldLocationStateProps).projectId
  }

  return {
    wallet: getWallet(state),
    mana: getMana(state)!,
    projectId,
    hasHistory: hasHistory(state),
    isFromDeployToWorld
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onNavigate: path => dispatch(push(path)),
  onReplace: (path, locationState) => dispatch(replace(path, locationState)),
  onBack: () => dispatch(goBack())
})

export default connect(mapState, mapDispatch)(ClaimENSPage)
