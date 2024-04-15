import { connect } from 'react-redux'
import { isLoadingSetProfileAvatarAlias, getError } from 'decentraland-dapps/dist/modules/profile/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import {
  GET_WORLD_PERMISSIONS_REQUEST,
  PUT_WORLD_PERMISSIONS_REQUEST,
  deleteWorldPermissionsRequest,
  postWorldPermissionsRequest,
  putWorldPermissionsRequest
} from 'modules/worlds/actions'
import { getAllProfiles, getWorldPermissions, getLoading } from 'modules/worlds/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './WorldPermissionsModal.types'
import WorldPermissionsModal from './WorldPermissionsModal'

/* isLoadingType(getLoading(state), POST_WORLD_PERMISSIONS_REQUEST) ||
isLoadingType(getLoading(state), PUT_WORLD_PERMISSIONS_REQUEST) ||
isLoadingType(getLoading(state), DELETE_WORLD_PERMISSIONS_REQUEST) ||
isLoadingType(getLoading(state), GET_PROFILES_REQUEST) */
const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  isLoading: isLoadingSetProfileAvatarAlias(state) || isLoadingType(getLoading(state), GET_WORLD_PERMISSIONS_REQUEST),
  isLoadingNewUser: isLoadingType(getLoading(state), PUT_WORLD_PERMISSIONS_REQUEST),
  error: getError(state),
  worldPermissions: getWorldPermissions(state, ownProps.metadata.worldName),
  profiles: getAllProfiles(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPutWorldPermissionsRequest: (worldName, permissionName, permissionType, newData) =>
    dispatch(putWorldPermissionsRequest(worldName, permissionName, permissionType, newData)),
  onPostWorldPermissionsRequest: (worldName, permissionName, permissionType) =>
    dispatch(postWorldPermissionsRequest(worldName, permissionName, permissionType)),
  onDeleteWorldPermissionsRequest: (worldName, permissionName, permissionType, address) =>
    dispatch(deleteWorldPermissionsRequest(worldName, permissionName, permissionType, address))
})

export default connect(mapState, mapDispatch)(WorldPermissionsModal)
