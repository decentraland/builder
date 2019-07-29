import * as React from 'react'

import SquaresGrid from 'components/SquaresGrid'
import { Props, DefaultProps } from './TemplateCard.types'
import './TemplateCard.css'

export default class TemplateCard extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    onClick: (_: any) => {
      /*noop */
    }
  }

  handleOnClick = () => {
    this.props.onClick(this.props.template)
  }

  render() {
    const { template } = this.props
    // Use 3x3 as the default size for the grid we render in the card
    // even if the undefined layout means `Custom build`
    let rows = 3
    let cols = 3

    if (template) {
      rows = template.rows
      cols = template.cols
    }

    return (
      <div className="TemplateCard" onClick={this.handleOnClick}>
        <div className="wrapper">
          <div className="grid-container">
            <SquaresGrid cols={cols} rows={rows} />
          </div>
          <div className="project-data">
            <div className="title">{template.title}</div>
            <div className="description">{template.description}</div>
          </div>
        </div>
      </div>
    )
  }
}
