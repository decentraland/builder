import * as React from 'react'
import { Props } from './Scene.types'
import './Scene.css'

export default class Scene extends React.PureComponent<Props> {
  render() {
    const { deployment, onMouseEnter, onMouseLeave } = this.props
    return (
      <div className="Scene" onMouseEnter={() => onMouseEnter(deployment)} onMouseLeave={() => onMouseLeave(deployment)}>
        {deployment.thumbnail ? (
          <div className="thumbnail" style={{ backgroundImage: `url(${deployment.thumbnail})` }}></div>
        ) : (
          <div className="no-thumbnail" />
        )}
        <div className="stat">
          <div className="title">{deployment.name}</div>
          {deployment.layout ? (
            <div className="secondary-text">
              {deployment.layout.rows}x{deployment.layout.cols}
            </div>
          ) : null}
        </div>
      </div>
    )
  }
}
