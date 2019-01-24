import * as React from 'react'

import { Props } from './ProjectCard.types'
import { getProjectDimensions } from 'modules/project/utils'
import './ProjectCard.css'

export default class ProjectCard extends React.PureComponent<Props> {
  static defaultProps = {
    onClick: (_: any) => {
      /*noop */
    }
  }

  handleOnClick = () => {
    this.props.onClick(this.props.project)
  }

  render() {
    const { project } = this.props

    return (
      <div className="ProjectCard Card" onClick={this.handleOnClick}>
        {/*<img src={project.thumbnail} alt={project.title} width={248} height={184} />*/}
        <div className="project-data">
          <div className="title">{project.title}</div>
          <div className="description" title={project.description}>
            {getProjectDimensions(project)}
          </div>
        </div>
      </div>
    )
  }
}
