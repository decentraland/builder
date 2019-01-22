import * as React from 'react'

import ProjectCard from 'components/ProjectCard'
import { Props } from './ProjectList.types'
import './ProjectList.css'

export default class ProjectList extends React.PureComponent<Props> {
  static defaultProps = {
    onClick: (_: any) => {
      /*noop */
    }
  }

  render() {
    const { projects, onClick } = this.props

    return (
      <div className="ProjectList">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} onClick={onClick} />
        ))}
      </div>
    )
  }
}
