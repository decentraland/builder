import * as React from 'react'
import { Link } from 'react-router-dom'

import { Dropdown } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import { Props } from './ProjectCard.types'
import { getProjectDimensions } from 'modules/project/utils'
import './ProjectCard.css'

export default class ProjectCard extends React.PureComponent<Props> {
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

  render() {
    const { project, onClick } = this.props

    const Component = (
      <>
        <Dropdown direction="left" onClick={e => e.nativeEvent.preventDefault()}>
          <Dropdown.Menu>
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

    let style
    let classes = 'ProjectCard Card'
    let overlay = null
    if (project.thumbnail) {
      style = { backgroundImage: `url(${project.thumbnail})` }
      classes += ' has-thumbnail'
      overlay = <div className="overlay" />
    }

    return onClick ? (
      <div className={classes} onClick={this.handleOnClick} style={style}>
        {overlay}
        {Component}
      </div>
    ) : (
      <Link to={locations.editor(project.id)} className={classes} style={style}>
        {overlay}
        {Component}
      </Link>
    )
  }
}
