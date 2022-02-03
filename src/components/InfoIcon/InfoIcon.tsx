import * as React from 'react'
import classnames from 'classnames'
import { omit } from 'decentraland-commons/dist/utils'
import styles from './InfoIcon.module.css'
import { Props } from './InfoIcon.types'

export default class InfoIcon extends React.PureComponent<Props> {
  render() {
    const { className } = this.props
    return <i {...omit(this.props, ['className'])} className={classnames(styles.info, className)} />
  }
}
