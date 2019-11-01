import * as React from 'react'
import { AssetParameterType, AssetParameter, AssetActionValue } from 'modules/asset/types'
import TextField from '../TextField'
import NumberField from '../NumberField'
import BooleanField from '../BooleanField'
import EntityField from '../EntityField'
import ActionField from '../ActionField'

import { Props, State } from './EntityParameters.types'

export default class EntityParameters extends React.PureComponent<Props, State> {
  state: State = {
    values: {}
  }

  componentWillMount() {
    this.setState({
      values: { ...this.props.values }
    })
  }

  handleFieldChange = (id: string, value: any) => {
    const values = { ...this.state.values, [id]: value }
    this.setState({ values })
    this.props.onChange(values)
  }

  renderField = (param: AssetParameter) => {
    const { values } = this.state

    switch (param.type) {
      case AssetParameterType.ACTION: {
        return (
          <ActionField
            label={param.label}
            value={values[param.id] as AssetActionValue}
            onChange={val => this.handleFieldChange(param.id, val)}
          />
        )
      }
      case AssetParameterType.ENTITY: {
        return (
          <EntityField label={param.label} value={values[param.id] as string} onChange={val => this.handleFieldChange(param.id, val)} />
        )
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
