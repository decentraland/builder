import React from 'react'
import classNames from 'classnames'
import { Props } from './ENSImage.types'
import styles from './ENSImage.module.css'

export class ENSImage extends React.PureComponent<Props> {
  render() {
    const { subdomain, isSmall } = this.props

    return (
      <div className={classNames(styles.ensImage, { [styles.small]: isSmall })}>
        <div className={styles.name}>{subdomain.slice(0, 2)}</div>
      </div>
    )
  }
}
