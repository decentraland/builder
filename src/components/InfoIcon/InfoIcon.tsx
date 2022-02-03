import * as React from 'react'
import classnames from 'classnames'
import styles from './InfoIcon.module.css'
import { Props } from './InfoIcon.types'

export default class InfoIcon extends React.PureComponent<Props> {
  render() {
    const { className } = this.props
    return <i {...this.props} className={classnames(styles.info, className)} />
  }
}
