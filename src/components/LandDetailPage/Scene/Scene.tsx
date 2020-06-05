import * as React from 'react'
import { Props } from './Scene.types'
import './Scene.css'

export default class Scene extends React.PureComponent<Props> {
  render() {
    const { project, onMouseEnter, onMouseLeave } = this.props
    return (
      <div className="Scene" onMouseEnter={() => onMouseEnter(project)} onMouseLeave={() => onMouseLeave(project)}>
        <div className="thumbnail" style={{ backgroundImage: `url(${project.thumbnail})` }}></div>
        <div className="stat">
          <div className="title">{project.title}</div>
          <div className="secondary-text">
            {project.layout.rows}x{project.layout.cols}
          </div>
        </div>
      </div>
    )
  }
}
