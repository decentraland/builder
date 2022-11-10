import React from 'react'
import classNames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { SmartIcon } from 'components/SmartIcon'
import './SmartBadge.css'

export type SmartBadgeProps = {
  className?: string
  size?: 'small' | 'normal'
}

export default class SmartBadge extends React.PureComponent<SmartBadgeProps> {
  static defaultProps = {
    className: '',
    size: 'normal'
  }

  render() {
    const { className, size } = this.props
    return (
      <div title={t('item_types.smart_wearable')} className={classNames('SmartBadge', className, size)}>
        <SmartIcon />
      </div>
    )
  }
}
