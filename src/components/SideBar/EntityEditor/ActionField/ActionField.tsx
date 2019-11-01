import * as React from 'react'
import { SelectField, DropdownProps } from 'decentraland-ui'
import { AssetParameterValues } from 'modules/asset/types'
import { Props, State } from './ActionField.types'
import EntityParameters from '../EntityParameters'
import EntityField from '../EntityField'

export default class ActionField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || { entityId: '', actionId: '', values: {} }
  }

  handleEntityChange = (entityId: string) => {
    const value = {
      entityId,
      actionId: '',
      values: {}
    }

    this.setState({ value })
  }

  handleActionChange = (_: any, data: DropdownProps) => {
    this.setState({
      value: {
        ...this.state.value,
        actionId: data.value as string
      }
    })
  }

  handleParametersChange = (values: AssetParameterValues) => {
    const value = { ...this.state.value, values }
    this.setState({ value })

    this.props.onChange(value)
  }

  getActionOptions = () => {
    const { entityAssets } = this.props
    const { value } = this.state

    if (entityAssets[value.entityId] && entityAssets[value.entityId].actions) {
      return entityAssets[value.entityId].actions.map(action => ({ key: action.id, text: action.label, value: action.id }))
    }

    return []
  }

  getParameters = () => {
    const { value } = this.state
    const { entityAssets } = this.props

    const action = entityAssets[value.entityId] && entityAssets[value.entityId].actions.find(a => a.id === value.actionId)
    if (action) {
      return action.parameters
    }

    return null
  }

  render() {
    const { label, entityAssets, className = '', value: actionValue } = this.props
    const { value } = this.state
    const options = this.getActionOptions()
    const parameters = this.getParameters()

    return (
      <div className={`TextField ${className}`}>
        <EntityField
          label={label}
          value={value ? value.entityId : ''}
          onChange={this.handleEntityChange}
          filter={Object.keys(entityAssets)}
        />
        {value.entityId && <SelectField label={label} value={value.actionId} options={options} onChange={this.handleActionChange} />}
        {parameters && <EntityParameters parameters={parameters} values={actionValue.values} onChange={this.handleParametersChange} />}
      </div>
    )
  }
}
