import * as React from 'react'
import { Link } from 'react-router-dom'
import { Dropdown, Confirm, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { DeployModalMetadata, DeployModalView } from 'components/Modals/DeployModal/DeployModal.types'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/preventDefault'
import { isRemoteURL } from 'modules/media/utils'
import { getProjectDimensions } from 'modules/project/utils'
import { DeploymentStatus as Status } from 'modules/deployment/types'
import DeploymentStatus from 'components/DeploymentStatus'
import Icon from 'components/Icon'
import { Props, DefaultProps, State } from './ProjectCard.types'
import './ProjectCard.css'

export default class ProjectCard extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    items: 0
  }

  state = {
    isDeleting: false
  }

  handleOnClick = () => {
    const { onClick, project } = this.props
    if (onClick) {
      onClick(project)
    }
  }

  handleConfirmDeleteProject = () => {
    this.setState({ isDeleting: true })
  }

  handleCancelDeleteProject = () => {
    this.setState({ isDeleting: false })
  }

  handleDeleteProject = () => {
    const { project, onDeleteProject } = this.props
    onDeleteProject(project)
    this.setState({ isDeleting: false })
  }

  handleDuplicateProject = () => {
    const { project, onDuplicateProject } = this.props
    onDuplicateProject(project)
  }

  handleExportScene = () => {
    this.props.onOpenModal('ExportModal', { project: this.props.project })
  }

  handleClearDeployment = () => {
    const { project, onOpenModal } = this.props
    onOpenModal('DeployModal', { view: DeployModalView.CLEAR_DEPLOYMENT, projectId: project.id } as DeployModalMetadata)
  }

  render() {
    const { project, items, deploymentStatus, onClick, isUploading, hasError } = this.props
    const { isDeleting } = this.state
    const canClearDeployment = deploymentStatus !== Status.UNPUBLISHED

    let style = {}
    let classes = 'ProjectCard'
    let Overlay = null

    if (project.thumbnail) {
      // prevent caching remote images when they are updated
      let url = project.thumbnail
      if (url && isRemoteURL(url)) {
        url += `?updated_at=${+new Date(project.updatedAt)}`
      }
      style = { backgroundImage: `url(${url})` }
      classes += ' has-thumbnail'
      Overlay = <div className="overlay" />
    }

    const children = (
      <>
        {Overlay}
        <DeploymentStatus projectId={project.id} className="deployment-status" />
        <Dropdown direction="left" onClick={preventDefault()}>
          <Dropdown.Menu>
            <Dropdown.Item text={t('home_page.project_actions.duplicate_project')} onClick={this.handleDuplicateProject} />
            <Dropdown.Item text={t('home_page.project_actions.export_project')} onClick={this.handleExportScene} />
            <Dropdown.Item text={t('home_page.project_actions.delete_project')} onClick={this.handleConfirmDeleteProject} />
            {canClearDeployment && <Dropdown.Item text={t('home_page.project_actions.unpublish')} onClick={this.handleClearDeployment} />}
          </Dropdown.Menu>
        </Dropdown>
        <div className="project-data">
          <div className="title-wrapper">
            <div className="title">{project.title}</div>
            {isUploading ? <Icon name="cloud-upload" className="is-uploading" /> : null}
            {!isUploading && hasError ? <div className="error-indicator" /> : null}
          </div>
          <div className="description" title={project.description}>
            {getProjectDimensions(project)} {items > 0 && `- ${items} ${t('global.items')}`}
          </div>
        </div>
      </>
    )

    return (
      <>
        {onClick ? (
          <div className={classes} onClick={this.handleOnClick} style={style}>
            {children}
          </div>
        ) : (
          <Link to={locations.editor(project.id)} className={classes} style={style}>
            {children}
          </Link>
        )}

        <Confirm
          size="tiny"
          open={isDeleting}
          header={t('project_card.confirm_delete_header', { title: project.title })}
          content={t('project_card.confirm_delete_content', { title: project.title })}
          confirmButton={<Button primary>{t('global.confirm')}</Button>}
          cancelButton={<Button secondary>{t('global.cancel')}</Button>}
          onCancel={this.handleCancelDeleteProject}
          onConfirm={this.handleDeleteProject}
        />
      </>
    )
  }
}
