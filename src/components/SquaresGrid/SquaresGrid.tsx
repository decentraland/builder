import * as React from 'react'

import Square from './Square'
import { Props, DefaultProps } from './SquaresGrid.types'
import './SquaresGrid.css'

export default class SquaresGrid extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    size: '',
    onClick: () => {
      /* noop */
    }
  }

  handleOnClick = () => {
    this.props.onClick()
  }

  times(count: number, callback: (index: number) => React.ReactChild) {
    return new Array(count).fill(0).map((_, index) => callback(index))
  }

  render() {
    const { rows, cols, size } = this.props
    return (
      <div className={`SquaresGrid squares-grid-${rows}-${cols} ${size}`} onClick={this.handleOnClick}>
        {rows === 1 && cols === 1 ? (
          <Square size={size || 'medium'} />
        ) : (
          this.times(cols, index => (
            <div key={index} className="squares-grid-col">
              {this.times(rows, index => (
                <Square key={index} size={size || 'small'} />
              ))}
            </div>
          ))
        )}
      </div>
    )
  }
}
