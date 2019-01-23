import * as React from 'react'

import { Props } from './TemplateCard.types'
import './TemplateCard.css'

export default class ProjectCard extends React.PureComponent<Props> {
  static defaultProps = {
    onClick: (_: any) => {
      /*noop */
    }
  }

  handleOnClick = () => {
    this.props.onClick(this.props.template)
  }

  render() {
    const { template } = this.props
    const { rows, cols } = template.parcelLayout

    return (
      <div className="TemplateCard Card" onClick={this.handleOnClick}>
        <div className="project-data">
          <div className={`squares-grid grid-${rows}-${cols}`}>
            {new Array(cols).fill(0).map((_, index) => (
              <div key={index} className="square-col">
                {new Array(rows).fill(0).map((_, index) => (
                  <div key={index} className="square-row square" />
                ))}
              </div>
            ))}
          </div>

          <div className="title">{template.title}</div>
          <div className="description">{template.description}</div>
        </div>
      </div>
    )
  }
}
