import * as React from 'react'
import { SelectField, DropdownProps, Button } from 'decentraland-ui'
import { AssetParameterValues, AssetActionValue } from 'modules/asset/types'
import { Props, State } from './ActionField.types'
import EntityParameters from '../EntityParameters'
import EntityField from '../EntityField'

export default class ActionField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || [{ entityName: '', actionId: '', values: {} }]
  }

  handleEntityChange = (entityName: string, index: number) => {
    const actions = this.getActionOptions(entityName)

    const value = Object.assign([], this.state.value, {
      [index]: {
        entityName,
        actionId: actions.length > 0 ? actions[0].value : '',
        values: {}
      }
    })

    this.setState({ value })

    this.props.onChange(value)
  }

  handleAddAction = () => {
    const index = this.state.value.length
    const value = Object.assign([], this.state.value, {
      [index]: {
        entityName: '',
        actionId: '',
        values: {}
      }
    })

    this.setState({ value })

    this.props.onChange(value)
  }

  handleActionChange = (data: DropdownProps, index: number) => {
    const value = Object.assign([], this.state.value, {
      [index]: {
        ...this.state.value[index],
        actionId: data.value as string
      }
    })

    this.setState({
      value
    })

    this.props.onChange(value)
  }

  handleParametersChange = (values: AssetParameterValues, index: number) => {
    const value = Object.assign([], this.state.value, {
      [index]: {
        ...this.state.value[index],
        values
      }
    })

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

  getParameters = (value: AssetActionValue) => {
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

    return (
      <div className={`ActionField ${className}`}>
        <span className="label">{label}</span>
        {value.map((action, i) => {
          const options = this.getActionOptions(action.entityName)
          const parameters = this.getParameters(action)
          const parameterValues = actionValue && actionValue[i] ? actionValue[i].values : {}

          return (
            <>
              <EntityField
                label={''}
                value={value ? action.entityName : ''}
                onChange={name => this.handleEntityChange(name, i)}
                filter={Object.keys(entityAssets)}
              />
              {action.entityName && (
                <SelectField value={action.actionId} options={options} onChange={(_, data) => this.handleActionChange(data, i)} />
              )}
              {parameters && (
                <EntityParameters
                  parameters={parameters}
                  values={parameterValues}
                  onChange={values => this.handleParametersChange(values, i)}
                />
              )}
            </>
          )
        })}
        <Button onClick={this.handleAddAction}>Add action</Button>
      </div>
    )
  }
}
