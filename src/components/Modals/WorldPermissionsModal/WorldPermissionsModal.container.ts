import { connect } from 'react-redux'
import { isLoadingSetProfileAvatarAlias, getError } from 'decentraland-dapps/dist/modules/profile/selectors'
import { RootState } from 'modules/common/types'
import { deleteWorldPermissionsRequest, postWorldPermissionsRequest, putWorldPermissionsRequest } from 'modules/worlds/actions'
import { getAllProfiles, getWorldPermissions } from 'modules/worlds/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './WorldPermissionsModal.types'
import WorldPermissionsModal from './WorldPermissionsModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  isLoading: isLoadingSetProfileAvatarAlias(state),
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
