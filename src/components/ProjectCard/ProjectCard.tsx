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

    // <img src={project.thumbnail} alt={project.title} width={248} height={184} />
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

    return onClick ? (
      <div className="ProjectCard Card" onClick={this.handleOnClick}>
        {Component}
      </div>
    ) : (
      <Link to={locations.editor(project.id)} className="ProjectCard Card">
        {Component}
      </Link>
    )
  }
}
