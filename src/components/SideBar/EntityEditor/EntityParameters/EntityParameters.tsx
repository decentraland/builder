import * as React from 'react'
import { AssetParameterType, AssetParameter, AssetActionValue } from 'modules/asset/types'
import TextField from '../TextField'
import NumberField from '../NumberField'
import BooleanField from '../BooleanField'
import EntityField from '../EntityField'
import ActionField from '../ActionField'
import OptionsField from '../OptionsField'

import { Props, State } from './EntityParameters.types'

export default class EntityParameters extends React.Component<Props, State> {
  state: State = {
    values: { ...this.props.values }
  }

  static getDerivedStateFromProps(props: Props) {
    if (props.values) {
      return {
        values: { ...props.values }
      }
    }

    return null
  }

  handleFieldChange = (id: string, value: any) => {
    const values = { ...this.state.values, [id]: value }
    this.setState({ values })
    this.props.onChange(values)
  }

  renderField = (param: AssetParameter) => {
    const { values } = this.state
    const { entityNames } = this.props

    switch (param.type) {
      case AssetParameterType.ACTIONS: {
        let actions = values[param.id] as AssetActionValue[]

        if (actions) {
          // Hide actions that correspond to inexistent entity references
          actions = actions.filter(action => entityNames.includes(action.entityName))
        }

        return <ActionField label={param.label} value={actions} onChange={val => this.handleFieldChange(param.id, val)} />
      }
      case AssetParameterType.ENTITY: {
        const entityName = values[param.id] as string
        if (!entityNames.includes(entityName)) return null
        return <EntityField label={param.label} value={entityName} onChange={val => this.handleFieldChange(param.id, val)} />
      }
      case AssetParameterType.STRING: {
        return <TextField label={param.label} value={values[param.id] as string} onChange={val => this.handleFieldChange(param.id, val)} />
      }
      case AssetParameterType.BOOLEAN: {
        return (
          <BooleanField label={param.label} value={values[param.id] as boolean} onChange={val => this.handleFieldChange(param.id, val)} />
        )
      }
      case AssetParameterType.INTEGER: {
        return (
          <NumberField label={param.label} value={values[param.id] as number} onChange={val => this.handleFieldChange(param.id, val)} />
        )
      }
      case AssetParameterType.OPTIONS: {
        return (
          <OptionsField
            label={param.label}
            value={values[param.id] as string}
            options={param.options!}
            onChange={val => this.handleFieldChange(param.id, val)}
          />
        )
      }
      case AssetParameterType.FLOAT: {
        return (
          <NumberField
            label={param.label}
            value={values[param.id] as number}
            onChange={val => this.handleFieldChange(param.id, val)}
            allowFloat
          />
        )
      }
      default:
        return null
    }
  }

  render() {
    const { parameters } = this.props
    return parameters.map(param => this.renderField(param))
  }
}
