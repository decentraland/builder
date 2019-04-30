import * as React from 'react'

import { DefaultProps, Props } from './Watermelon.types'
import './Watermelon.css'

export default class Watermelon extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    width: 100,
    height: 100
  }
  render() {
    const { width, height, className } = this.props
    let classes = 'Watermelon'
    if (className) {
      classes += ' ' + className
    }
    const style = {
      width,
      height
    }
    return <div className={classes} style={style} />
  }
}
