import * as React from 'react'
import { Field } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props, State } from './EmptyManager.types'
import './EmptyManager.css'

export default class EmptyManager extends React.PureComponent<Props, State> {
  state: State = {
    manager: ''
  }

  handleAdd = () => {
    const { onAdd } = this.props
    const { manager } = this.state
    onAdd(manager)
  }

  handleCancel = () => {
    const { onCancel } = this.props
    onCancel()
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      manager: event.target.value
    })
  }

  render() {
    const { manager } = this.state
    return (
      <div className="EmptyManager">
        <Field className="rounded" type="address" value={manager} onChange={this.handleChange} placeholder="0x..." />
        <span className="action link" onClick={this.handleAdd}>
          {t('global.add')}
        </span>
        <span className="action link" onClick={this.handleCancel}>
          {t('global.cancel')}
        </span>
      </div>
    )
  }
}
