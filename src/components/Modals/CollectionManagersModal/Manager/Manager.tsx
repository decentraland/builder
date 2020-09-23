import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { shorten } from 'lib/address'
import Profile from 'components/Profile'
import { Props } from './Manager.types'
import './Manager.css'

export default class Manager extends React.PureComponent<Props> {
  handleRemove = () => {
    const { manager, onRemove } = this.props
    onRemove(manager)
  }

  render() {
    const { manager } = this.props
    return (
      <div className="Manager">
        <div className="info">
          <Profile address={manager} blockieOnly={true} />
          {shorten(manager)}
        </div>
        <span className="action link" onClick={this.handleRemove}>
          {t('global.delete')}
        </span>
      </div>
    )
  }
}
