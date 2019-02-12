import * as React from 'react'
import { Props } from './GroundCard.types'

import './GroundCard.css'

export default class GroundCard extends React.PureComponent<Props> {
  static defaultProps = {
    isActive: false,
    small: false,
    thumbnail: null
  }

  handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.name)
    }
  }

  render() {
    const { name, thumbnail, isActive, small, className, onClick } = this.props
    const classes = ['GroundCard']

    if (className) classes.push(className)
    if (isActive) classes.push('active')
    if (!thumbnail) classes.push('empty')
    if (small) classes.push('small')
    if (onClick) classes.push('clickable')

    return (
      <div className={classes.join(' ')} onClick={this.handleClick}>
        {thumbnail && (
          <>
            <div className="overlay" />
            <img src={thumbnail} title={name} />
          </>
        )}
      </div>
    )
  }
}
