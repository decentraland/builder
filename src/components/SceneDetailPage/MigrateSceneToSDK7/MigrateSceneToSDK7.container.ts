import { connect } from 'react-redux'
import { MIGRATE_TO_SDK7_REQUEST, migrateToSDK7Request } from 'modules/scene/actions'
import { getLoading } from 'modules/scene/selectors'
import { getLoading as getProjectLoading } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { DUPLICATE_PROJECT_REQUEST } from 'modules/project/actions'
import { getLoadingSet } from 'modules/sync/selectors'
import SceneDetailPage from './MigrateSceneToSDK7'
import { MapDispatch, MapDispatchProps, MapStateProps, OwnProps } from './MigrateSceneToSDK7.types'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  return {
    isLoading: isLoadingType(getLoading(state), MIGRATE_TO_SDK7_REQUEST),
    isSavingScene: !!ownProps.project?.id && getLoadingSet(state).has(ownProps.project?.id),
    isSavingSDK6Copy: isLoadingType(getProjectLoading(state), DUPLICATE_PROJECT_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onMigrateScene: (project: Project, shouldSaveCopy: boolean) => dispatch(migrateToSDK7Request(project, shouldSaveCopy))
})

export default connect(mapState, mapDispatch)(SceneDetailPage)
