import * as React from 'react'
import { Dropdown } from 'decentraland-ui'
import { AssetParameterValues, AssetActionValue, AssetAction, AssetParameterType } from 'modules/asset/types'
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
    const action = this.findAction(entityName, actionId)
    const values: Record<string, any> = this.getActionValues(action)

    const value = Object.assign([], this.props.value, {
      [index]: {
        entityName,
        actionId,
        values
      }
    })

    this.props.onChange(value, false)
  }

  handleAddAction = () => {
    const { value, entityAssets } = this.props
    const index = this.props.value ? this.props.value.length : 0
    const entityName = Object.keys(entityAssets)[0]
    const actions = this.getActionOptions(entityName)
    const actionId = actions.length > 0 ? actions[0].value : ''
    const action = actionId ? this.findAction(entityName, actionId) : null

    const val = Object.assign([], value, {
      [index]: {
        entityName,
        actionId,
        values: action ? this.getActionValues(action) : {}
      }
    })

    this.props.onChange(val, false)
  }

  handleActionChange = (actionId: string, index: number) => {
    const { entityName } = this.props.value[index]
    const action = this.findAction(entityName, actionId)
    const values: Record<string, any> = this.getActionValues(action)

    const value = Object.assign([], this.props.value, {
      [index]: {
        ...this.props.value[index],
        actionId,
        values
      }
    })

    this.props.onChange(value, false)
  }

  handleParametersChange = (values: AssetParameterValues, index: number, debounce: boolean) => {
    const value = Object.assign([], this.props.value, {
      [index]: {
        ...this.props.value[index],
        values
      }
    })

    this.props.onChange(value, debounce)
  }

  handleRemove = (index: number) => {
    const value = this.props.value.filter((_, i) => i !== index)
    this.setState({ value })
    this.props.onChange(value, false)
  }

  handleReset = (index: number) => {
    const { value, entityAssets, parameter, entityName } = this.props
    const newEntityName = parameter.default ? entityName : Object.keys(entityAssets)[0]
    const actions = this.getActionOptions(newEntityName)
    const actionId = parameter.default || (actions.length > 0 ? actions[0].value : '')

    const val = Object.assign([], value, {
      [index]: {
        entityName: newEntityName,
        actionId,
        values: {}
      }
    })

    this.props.onChange(val, false)
  }

  findAction(entityName: string, actionId: string) {
    return this.props.entityAssets[entityName].actions.find(a => a.id === actionId)
  }

  getActionOptions = (entityName: string) => {
    const { entityAssets } = this.props

    if (entityAssets[entityName] && entityAssets[entityName].actions) {
      return entityAssets[entityName].actions.map(action => ({ label: action.label, value: action.id }))
    }

    return []
  }

  getParameters = (value: AssetActionValue) => {
    const { entityName, actionId } = value

    const action = this.findAction(entityName, actionId)
    if (action) {
      return action.parameters
    }

    return null
  }

  getActionValues = (action: AssetAction | undefined) => {
    let values: Record<string, any> = {}

    if (action) {
      values = action.parameters.reduce<any>((values, parameter) => {
        values[parameter.id] = parameter.type === AssetParameterType.ACTIONS ? [] : parameter.default
        return values
      }, {})
    }

    return values
  }

  render() {
    const { id, label, entityAssets, className = '', value } = this.props

    return (
      <section className={`ActionField ParameterField ${className}`}>
        <div className="header">
          <label htmlFor={id} className="label">
            {label}
          </label>
          <div title="Add Action">
            <Icon name="add-active" onClick={this.handleAddAction} />
          </div>
        </div>

        {value &&
          value.map((action, i) => {
            const actionId = `${id}-${i}`
            const options = this.getActionOptions(action.entityName)
            const parameters = this.getParameters(action)
            const parameterValues = value && value[i] ? value[i].values : {}
            return (
              <div className="container" key={actionId}>
                <div className="signature">
                  <EntityField
                    id={actionId}
                    value={value ? action.entityName : ''}
                    onChange={name => this.handleEntityChange(name, i)}
                    filter={Object.keys(entityAssets)}
                    className={'action'}
                    direction={null}
                  />
                  {action.entityName && (
                    <OptionsField
                      id={`${actionId}-actions`}
                      value={action.actionId}
                      options={options}
                      onChange={actionid => this.handleActionChange(actionid, i)}
                      className={'action'}
                    />
                  )}
                  <Dropdown trigger={<Icon className="action-options" name="ellipsis" />} direction="left" title="More Options">
                    <Dropdown.Menu>
                      <Dropdown.Item text="Reset Action" onClick={() => this.handleReset(i)} />
                      <Dropdown.Item text="Remove Action" onClick={() => this.handleRemove(i)} />
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {parameters && parameters.length > 0 && (
                  <aside>
                    <EntityParameters
                      id={`${actionId}-parameters`}
                      entityName={action.entityName}
                      parameters={parameters}
                      values={parameterValues}
                      onChange={(values, debounce) => this.handleParametersChange(values, i, debounce)}
                      className="action"
                    />
                  </aside>
                )}
              </div>
            )
          })}
      </section>
    )
  }
}
