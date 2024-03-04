import * as React from 'react'
import { Form, Button, InputOnChangeData } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { AddressField } from 'decentraland-dapps/dist/components/AddressField'

import { Props, State } from './EmptyRole.types'
import './EmptyRole.css'

export default class EmptyRole extends React.PureComponent<Props, State> {
  state: State = {
    address: ''
  }

  handleAdd = () => {
    const { onAdd } = this.props
    const { address } = this.state
    onAdd(address)
  }

  handleCancel = () => {
    const { onCancel } = this.props
    onCancel()
  }

  handleChange = (_: React.ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    this.setState({
      address: value
    })
  }

  render() {
    return (
      <Form className="EmptyRole" onSubmit={this.handleAdd}>
        <AddressField className="rounded-address" fieldClassName="rounded" onChange={this.handleChange} placeholder="0x..." />
        <Button basic className="action link">
          {t('global.add')}
        </Button>
        <span className="action link" onClick={this.handleCancel}>
          {t('global.cancel')}
        </span>
      </Form>
    )
  }
}
