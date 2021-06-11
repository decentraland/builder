import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { shorten } from 'lib/address'
import Profile from 'components/Profile'
import { Props } from './Role.types'
import './Role.css'

export default class Role extends React.PureComponent<Props> {
  handleRemove = () => {
    const { address, onRemove } = this.props
    onRemove(address)
  }

  render() {
    const { address } = this.props
    return (
      <div className="Role">
        <div className="info">
          <Profile address={address} />
          <div className="address">{shorten(address)}</div>
        </div>
        <span className="action link" onClick={this.handleRemove}>
          {t('global.delete')}
        </span>
      </div>
    )
  }
}
