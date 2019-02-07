import * as React from 'react'
import { Link } from 'react-router-dom'

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

  render() {
    const { project, onClick } = this.props

    const Component = (
      <>
        <div className="project-data">
          <div className="title">{project.title}</div>
          <div className="description" title={project.description}>
            {getProjectDimensions(project)}
          </div>
        </div>
      </>
    )

    const style = project.thumbnail ? { backgroundImage: `url(${project.thumbnail})` } : undefined
    let classes = 'ProjectCard Card'
    if (project.thumbnail) {
      classes += ' has-thumbnail'
    }

    return onClick ? (
      <div className={classes} onClick={this.handleOnClick} style={style}>
        {Component}
      </div>
    ) : (
      <Link to={locations.editor(project.id)} className={classes} style={style}>
        {Component}
      </Link>
    )
  }
}
