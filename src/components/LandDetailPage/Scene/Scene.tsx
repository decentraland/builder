import * as React from 'react'
import { Dropdown, Button, Icon } from 'decentraland-ui'
import { locations } from 'routing/locations'
import SceneStats from 'components/SceneStats'
import { DeployModalView, DeployModalMetadata } from 'components/Modals/DeployModal/DeployModal.types'
import { Props } from './Scene.types'
import './Scene.css'

export default class Scene extends React.PureComponent<Props> {
  render() {
    const { deployment, onMouseEnter, onMouseLeave, onNavigate, onOpenModal, projects } = this.props
    const project = deployment.projectId && deployment.projectId in projects ? projects[deployment.projectId] : null

    return (
      <div
        className={`Scene ${project ? 'clickable' : ''}`}
        onClick={() => project && onNavigate(locations.sceneDetail(project.id))}
        onMouseEnter={() => onMouseEnter(deployment)}
        onMouseLeave={() => onMouseLeave(deployment)}
      >
        {deployment.thumbnail ? (
          <div className="thumbnail" style={{ backgroundImage: `url(${deployment.thumbnail})` }}></div>
        ) : (
          <div className="no-thumbnail" />
        )}
        <div className="stat">
          <div className="title" title={deployment.name}>
            {deployment.name}
          </div>
          {deployment.layout ? (
            <div className="secondary-text">
              {deployment.layout.rows}x{deployment.layout.cols}
            </div>
          ) : null}
        </div>
        <SceneStats deployment={deployment} />
        <Dropdown
          trigger={
            <Button basic>
              <Icon name="ellipsis horizontal" />
            </Button>
          }
          inline
          direction="left"
        >
          <Dropdown.Menu>
            <Dropdown.Item
              text="Unpublish"
              onClick={() =>
                onOpenModal('DeployModal', { view: DeployModalView.CLEAR_DEPLOYMENT, deploymentId: deployment.id } as DeployModalMetadata)
              }
            />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }
}
