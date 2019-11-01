import * as React from 'react'
import { SelectField, DropdownProps } from 'decentraland-ui'
import { AssetParameterValues } from 'modules/asset/types'
import { Props, State } from './ActionField.types'
import EntityParameters from '../EntityParameters'
import EntityField from '../EntityField'

export default class ActionField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || { entityName: '', actionId: '', values: {} }
  }

  handleEntityChange = (entityName: string) => {
    const actions = this.getActionOptions(entityName)

    const value = {
      entityName,
      actionId: actions.length > 0 ? actions[0].value : '',
      values: {}
    }

    this.setState({ value })

    this.props.onChange(value)
  }

  handleActionChange = (_: any, data: DropdownProps) => {
    const value = {
      ...this.state.value,
      actionId: data.value as string
    }

    this.setState({
      value
    })

    this.props.onChange(value)
  }

  handleParametersChange = (values: AssetParameterValues) => {
    const value = { ...this.state.value, values }
    this.setState({ value })

    this.props.onChange(value)
  }

  getActionOptions = (entityName: string) => {
    const { entityAssets } = this.props

    if (entityAssets[entityName] && entityAssets[entityName].actions) {
      return entityAssets[entityName].actions.map(action => ({ key: action.id, text: action.label, value: action.id }))
    }

    return []
  }

  getParameters = () => {
    const { value } = this.state
    const { entityAssets } = this.props

    const action = entityAssets[value.entityName] && entityAssets[value.entityName].actions.find(a => a.id === value.actionId)
    if (action) {
      return action.parameters
    }

    return null
  }

  render() {
    const { label, entityAssets, className = '', value: actionValue } = this.props
    const { value } = this.state
    const options = this.getActionOptions(value.entityName)
    const parameters = this.getParameters()
    const parameterValues = actionValue ? actionValue.values : {}

    return (
      <div className={`TextField ${className}`}>
        <EntityField
          label={label}
          value={value ? value.entityName : ''}
          onChange={this.handleEntityChange}
          filter={Object.keys(entityAssets)}
        />
        {value.entityName && <SelectField value={value.actionId} options={options} onChange={this.handleActionChange} />}
        {parameters && <EntityParameters parameters={parameters} values={parameterValues} onChange={this.handleParametersChange} />}
      </div>
    )
  }
}
