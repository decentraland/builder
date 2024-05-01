import { connect } from 'react-redux'
import { getError } from 'decentraland-dapps/dist/modules/profile/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import {
  GET_WORLD_PERMISSIONS_REQUEST,
  PUT_WORLD_PERMISSIONS_REQUEST,
  deleteWorldPermissionsRequest,
  getWorldPermissionsRequest,
  postWorldPermissionsRequest,
  putWorldPermissionsRequest
} from 'modules/worlds/actions'
import { getWorldPermissions, getLoading } from 'modules/worlds/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './WorldPermissionsModal.types'
import WorldPermissionsModal from './WorldPermissionsModal'
import { loadProfileRequest } from 'decentraland-dapps/dist/modules/profile'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  isLoading: isLoadingType(getLoading(state), GET_WORLD_PERMISSIONS_REQUEST),
  isLoadingNewUser: isLoadingType(getLoading(state), PUT_WORLD_PERMISSIONS_REQUEST),
  error: getError(state),
  worldPermissions: getWorldPermissions(state, ownProps.metadata.worldName)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPutWorldPermissionsRequest: (worldName, permissionName, permissionType, newData) =>
    dispatch(putWorldPermissionsRequest(worldName, permissionName, permissionType, newData)),
  onPostWorldPermissionsRequest: (worldName, permissionName, permissionType) =>
    dispatch(postWorldPermissionsRequest(worldName, permissionName, permissionType)),
  onDeleteWorldPermissionsRequest: (worldName, permissionName, permissionType, address) =>
    dispatch(deleteWorldPermissionsRequest(worldName, permissionName, permissionType, address)),
  onGetProfile: walletAddress => dispatch(loadProfileRequest(walletAddress)),
  onGetWorldPermissions: worldName => dispatch(getWorldPermissionsRequest(worldName))
})

export default connect(mapState, mapDispatch)(WorldPermissionsModal)
