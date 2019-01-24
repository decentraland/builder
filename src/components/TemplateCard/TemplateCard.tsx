import * as React from 'react'

import SquaresGrid from 'components/SquareGrid'
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
    // Use 2x4 as the default size for the grid we render in the card
    // even if the undefined parcelLayout means `Custom build`
    let rows = 2
    let cols = 4

    if (template.parcelLayout) {
      rows = template.parcelLayout.rows
      cols = template.parcelLayout.cols
    }

    return (
      <div className="TemplateCard Card" onClick={this.handleOnClick}>
        <div className="project-data">
          <SquaresGrid cols={cols} rows={rows} />

          <div className="title">{template.title}</div>
          <div className="description">{template.description}</div>
        </div>
      </div>
    )
  }
}
