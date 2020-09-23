import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { shorten } from 'lib/address'
import Profile from 'components/Profile'
import { Props } from './Manager.types'
import './Manager.css'

export default class Manager extends React.PureComponent<Props> {
  handleRemove = () => {
    const { collaborator, onRemove } = this.props
    onRemove(collaborator)
  }

  render() {
    const { collaborator } = this.props
    return (
      <div className="Manager">
        <div className="info">
          <Profile address={collaborator} blockieOnly={true} />
          {shorten(collaborator)}
        </div>
        <span className="action link" onClick={this.handleRemove}>
          {t('global.delete')}
        </span>
      </div>
    )
  }
}
