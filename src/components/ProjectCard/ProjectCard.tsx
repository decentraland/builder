import * as React from 'react'
import { Link } from 'react-router-dom'
import { Icon, Dropdown } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import { Props, DefaultProps } from './ProjectCard.types'
import { getProjectDimensions } from 'modules/project/utils'
import './ProjectCard.css'

export default class ProjectCard extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    hasSubmittedProject: false
  }

  handleOnClick = () => {
    const { onClick } = this.props
    if (onClick) {
      onClick(this.props.project)
    }
  }

  handleDeleteProject = () => {
    const { project, onDeleteProject } = this.props
    onDeleteProject(project.id)
  }

  handleDuplicateProject = () => {
    const { project, onDuplicateProject } = this.props
    onDuplicateProject(project.id)
  }

  render() {
    const { project, hasSubmittedProject, onClick } = this.props

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
          <span className="contest-badge" data-balloon-pos="down" data-balloon={t('project_card.added_to_contest')}>
            <Icon name="star" />
          </span>
        ) : null}
        <Dropdown direction="left" onClick={e => e.nativeEvent.preventDefault()}>
          <Dropdown.Menu>
            <Dropdown.Item text={t('homepage.project_actions.duplicate_project')} onClick={this.handleDuplicateProject} />
            <Dropdown.Item text={t('homepage.project_actions.delete_project')} onClick={this.handleDeleteProject} />
          </Dropdown.Menu>
        </Dropdown>
        <div className="project-data">
          <div className="title">{project.title}</div>
          <div className="description" title={project.description}>
            {getProjectDimensions(project)}
          </div>
        </div>
      </>
    )

    return onClick ? (
      <div className={classes} onClick={this.handleOnClick} style={style}>
        {children}
      </div>
    ) : (
      <Link to={locations.editor(project.id)} className={classes} style={style}>
        {children}
      </Link>
    )
  }
}
