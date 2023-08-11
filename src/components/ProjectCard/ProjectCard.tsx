import * as React from 'react'
import { Link } from 'react-router-dom'
import { Confirm, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import { Pool } from 'modules/pool/types'
import { isRemoteURL } from 'modules/media/utils'
import DeploymentStatus from 'components/DeploymentStatus'
import Icon from 'components/Icon'
import { OptionsDropdown } from 'components/OptionsDropdown'
import SDKTag from 'components/SDKTag/SDKTag'
import { Props, DefaultProps, State } from './ProjectCard.types'
import './ProjectCard.css'

export default class ProjectCard extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    items: 0,
    parcels: 0
  }

  state = {
    isDeleting: false
  }

  componentDidMount() {
    this.props.onLoadProjectScene(this.props.project, this.props.type)
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

  render() {
    const { project, parcels, items, onClick, isUploading, hasError, scene, isInspectorEnabled } = this.props
    const { isDeleting } = this.state
    const isFromScenePool = 'likes' in (project as Pool)

    let style = {}
    let classes = 'ProjectCard'

    if (project.thumbnail) {
      // prevent caching remote images when they are updated
      let url = project.thumbnail
      if (url && isRemoteURL(url)) {
        url += `?updated_at=${+new Date(project.updatedAt)}`
      }
      style = { backgroundImage: `url(${url})` }
      classes += ' has-thumbnail'
    }

    const dropdownOptions = [
      { text: t('scenes_page.project_actions.duplicate_project'), handler: this.handleDuplicateProject },
      ...(scene?.sdk6 ? [{ text: t('scenes_page.project_actions.export_project'), handler: this.handleExportScene }] : []),
      { text: t('scenes_page.project_actions.delete_project'), handler: this.handleConfirmDeleteProject }
    ]

    const children = (
      <>
        <div className="project-thumbnail" style={style} />
        {isFromScenePool ? null : (
          <>
            <DeploymentStatus projectId={project.id} className="deployment-status" />
            <div className="options-container">
              {isInspectorEnabled && <SDKTag scene={scene} />}
              <OptionsDropdown className="options-dropdown" options={dropdownOptions} />
            </div>
          </>
        )}
        <div className="project-data">
          <div className="title-wrapper">
            <div className="title">{project.title}</div>
            {isUploading ? <Icon name="cloud-upload" className="is-uploading" /> : null}
            {!isUploading && hasError ? <div className="error-indicator" /> : null}
          </div>
          <div className="description" title={project.description}>
            <Icon name="scene-parcel" /> {t('public_page.parcel_count', { parcels })}
            <Icon name="scene-object" /> {t('project_card.item_count', { items })}
          </div>
        </div>
      </>
    )

    return (
      <>
        {onClick ? (
          <div className={classes} onClick={this.handleOnClick}>
            {children}
          </div>
        ) : (
          <Link to={isFromScenePool ? locations.poolView(project.id, 'pool') : locations.sceneDetail(project.id)} className={classes}>
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
