import * as React from 'react'
import { Dropdown, Button, Icon } from 'decentraland-ui'
import { locations } from 'routing/locations'
import SceneStats from 'components/SceneStats'
import { DeployModalView, DeployModalMetadata } from 'components/Modals/DeployModal/DeployModal.types'
import { Props } from './Scene.types'
import './Scene.css'

export const Scene: React.FC<Props> = (props: Props) => {
  const { deployment, onMouseEnter, onMouseLeave, onNavigate, onOpenModal, projects, disabled } = props
  const project = deployment.projectId && deployment.projectId in projects ? projects[deployment.projectId] : null

  const handleOnMouseEnter = React.useCallback(() => {
    if (!disabled) {
      onMouseEnter(deployment)
    }
  }, [onMouseEnter, disabled, deployment])

  const handleOnMouseLeave = React.useCallback(() => {
    if (!disabled) {
      onMouseLeave(deployment)
    }
  }, [onMouseLeave, disabled, deployment])

  const handleOnClick = React.useCallback(() => {
    if (project && !disabled) {
      onNavigate(locations.sceneDetail(project.id))
    }
  }, [onNavigate, project, disabled])

  const handleUnpublishClick = React.useCallback(() => {
    onOpenModal('DeployModal', { view: DeployModalView.CLEAR_DEPLOYMENT, deploymentId: deployment.id } as DeployModalMetadata)
  }, [onOpenModal, deployment])

  return (
    <div
      className={`Scene ${project && !disabled ? 'clickable' : ''}`}
      onClick={handleOnClick}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
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
        disabled={disabled}
        direction="left"
      >
        <Dropdown.Menu>
          <Dropdown.Item text="Unpublish" onClick={handleUnpublishClick} />
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}
