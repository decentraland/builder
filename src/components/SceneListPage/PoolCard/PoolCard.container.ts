import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getDeploymentStatusByProjectId } from 'modules/deployment/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { openModal } from 'modules/modal/actions'

import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './PoolCard.types'
import ProjectCard from './PoolCard'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { pool } = ownProps
  const scene = getScenes(state)[pool.sceneId]
  return {
    items: scene ? scene.metrics.entities : 0,
    deploymentStatus: getDeploymentStatusByProjectId(state)[ownProps.pool.id]
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(ProjectCard)
