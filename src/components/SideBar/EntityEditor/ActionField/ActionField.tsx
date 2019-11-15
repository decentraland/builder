import * as React from 'react'
import { Button } from 'decentraland-ui'
import { AssetParameterValues, AssetActionValue } from 'modules/asset/types'
import Icon from 'components/Icon'
import EntityParameters from '../EntityParameters'
import OptionsField from '../OptionsField'
import EntityField from '../EntityField'
import { Props } from './ActionField.types'
import './ActionField.css'

export default class ActionField extends React.PureComponent<Props> {
  handleEntityChange = (entityName: string, index: number) => {
    const actions = this.getActionOptions(entityName)
    const actionId = actions.length > 0 ? actions[0].value : ''
    const action = this.props.entityAssets[entityName].actions.find(a => a.id === actionId)
    let values: Record<string, any> = {}

    if (action) {
      values = action.parameters.reduce<any>((acc, val) => {
        acc[val.id] = val.options![0].value
        return acc
      }, {})
    }

    const value = Object.assign([], this.props.value, {
      [index]: {
        entityName,
        actionId,
        values
      }
    })

    this.props.onChange(value)
  }

  handleAddAction = () => {
    const { value, entityAssets } = this.props
    const index = this.props.value ? this.props.value.length : 0
    const entityName = Object.keys(entityAssets)[0]
    const actions = this.getActionOptions(entityName)

    const val = Object.assign([], value, {
      [index]: {
        entityName,
        actionId: actions.length > 0 ? actions[0].value : '',
        values: {}
      }
    })

    this.props.onChange(val)
  }

  handleActionChange = (actionId: string, index: number) => {
    const value = Object.assign([], this.props.value, {
      [index]: {
        ...this.props.value[index],
        actionId
      }
    })

    this.props.onChange(value)
  }

  handleParametersChange = (values: AssetParameterValues, index: number) => {
    const value = Object.assign([], this.props.value, {
      [index]: {
        ...this.props.value[index],
        values
      }
    })

    this.props.onChange(value)
  }

  handleRemove = (index: number) => {
    const value = this.props.value.filter((_, i) => i !== index)
    this.setState({ value })
    this.props.onChange(value)
  }

  getActionOptions = (entityName: string) => {
    const { entityAssets } = this.props

    if (entityAssets[entityName] && entityAssets[entityName].actions) {
      return entityAssets[entityName].actions.map(action => ({ label: action.label, value: action.id }))
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
    const { label, entityAssets, className = '', value } = this.props

    return (
      <section className={`ActionField ParameterField ${className}`}>
        <div className="header">
          <span className="label">{label}</span>
          <Icon name="add-active" onClick={this.handleAddAction} />
        </div>

        {value &&
          value.map((action, i) => {
            const options = this.getActionOptions(action.entityName)
            const parameters = this.getParameters(action)
            const parameterValues = value && value[i] ? value[i].values : {}
            return (
              <>
                <div className="container">
                  <div className="signature">
                    <EntityField
                      value={value ? action.entityName : ''}
                      onChange={name => this.handleEntityChange(name, i)}
                      filter={Object.keys(entityAssets)}
                      className={'action'}
                    />
                    {action.entityName && (
                      <OptionsField
                        value={action.actionId}
                        options={options}
                        onChange={actionid => this.handleActionChange(actionid, i)}
                        className={'action'}
                      />
                    )}
                  </div>
                  {parameters && (
                    <EntityParameters
                      parameters={parameters}
                      values={parameterValues}
                      onChange={values => this.handleParametersChange(values, i)}
                      className="action"
                    />
                  )}
                </div>

                <Button size="tiny" onClick={() => this.handleRemove(i)} basic>
                  Remove
                </Button>
              </>
            )
          })}
      </section>
    )
  }
}
