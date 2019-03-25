import * as React from 'react'
import { Link } from 'react-router-dom'
import { Icon, Dropdown, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Confirm from 'components/Confirm'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/preventDefault'
import { getProjectDimensions } from 'modules/project/utils'
import { Props, DefaultProps, State } from './ProjectCard.types'
import './ProjectCard.css'

export default class ProjectCard extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    hasSubmittedProject: false,
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

  render() {
    const { project, hasSubmittedProject, items, onClick } = this.props
    const { isDeleting } = this.state

    let style = {}
    let classes = 'ProjectCard Card'
    let Overlay = null

    if (project.thumbnail) {
      style = { backgroundImage: `url(${project.thumbnail})` }
      classes += ' has-thumbnail'
      Overlay = <div className="overlay" />
    }

    const children = (
      <>
        {Overlay}
        {hasSubmittedProject ? (
          <Popup
            content={t('project_card.added_to_contest')}
            position="top center"
            trigger={
              <span className="contest-badge">
                <Icon name="star" />
              </span>
            }
            on="hover"
            inverted
          />
        ) : null}
        <Dropdown direction="left" onClick={preventDefault()}>
          <Dropdown.Menu>
            <Dropdown.Item text={t('home_page.project_actions.duplicate_project')} onClick={this.handleDuplicateProject} />
            <Dropdown.Item text={t('home_page.project_actions.delete_project')} onClick={this.handleConfirmDeleteProject} />
          </Dropdown.Menu>
        </Dropdown>
        <div className="project-data">
          <div className="title">{project.title}</div>
          <div className="description" title={project.description}>
            {getProjectDimensions(project)} {items > 0 && `- ${items} items`}
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
          open={isDeleting}
          header={t('project_card.confirm_delete_header', { title: project.title })}
          content={t('project_card.confirm_delete_content', { title: project.title })}
          onCancel={this.handleCancelDeleteProject}
          onConfirm={this.handleDeleteProject}
        />
      </>
    )
  }
}
