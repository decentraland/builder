import * as React from 'react'
import { AssetParameterType, AssetParameter, AssetActionValue } from 'modules/asset/types'
import TextField from '../TextField'
import NumberField from '../NumberField'
import BooleanField from '../BooleanField'
import EntityField from '../EntityField'
import ActionField from '../ActionField'
import OptionsField from '../OptionsField'
import TextAreaField from '../TextAreaField'
import SliderField from '../SliderField'

import { Props } from './EntityParameters.types'

export default class EntityParameters extends React.PureComponent<Props> {
  handleFieldChange = (id: string, value: any, debounce = false) => {
    const values = { ...this.props.values, [id]: value }
    this.props.onChange(values, debounce)
  }

  renderField = (param: AssetParameter) => {
    const { id, values } = this.props
    const { entityNames, entityName, className = '' } = this.props
    const parameterId = `${id}-${entityName}-${param.id}`

    switch (param.type) {
      case AssetParameterType.ACTIONS: {
        let actions = values[param.id] as AssetActionValue[]

        if (actions) {
          // Hide actions that correspond to inexistent entity references
          actions = actions.filter(action => entityNames.includes(action.entityName))
        }

        return (
          <ActionField
            id={parameterId}
            key={parameterId}
            label={param.label}
            parameter={param}
            entityName={entityName}
            value={actions}
            onChange={(val, debounce) => this.handleFieldChange(param.id, val, debounce)}
            className={className}
          />
        )
      }
      case AssetParameterType.ENTITY: {
        const entityName = values[param.id] as string
        return (
          <EntityField
            id={parameterId}
            key={parameterId}
            label={param.label}
            value={entityName}
            onChange={val => this.handleFieldChange(param.id, val)}
            className={className}
          />
        )
      }
      case AssetParameterType.TEXT: {
        return (
          <TextField
            id={parameterId}
            key={parameterId}
            label={param.label}
            value={values[param.id] as string}
            onChange={val => this.handleFieldChange(param.id, val, true)}
            className={className}
          />
        )
      }
      case AssetParameterType.BOOLEAN: {
        return (
          <BooleanField
            id={parameterId}
            key={parameterId}
            label={param.label}
            value={values[param.id] as boolean}
            onChange={val => this.handleFieldChange(param.id, val)}
            className={className}
          />
        )
      }
      case AssetParameterType.INTEGER: {
        return (
          <NumberField
            id={parameterId}
            key={parameterId}
            label={param.label}
            value={values[param.id] as number}
            onChange={val => this.handleFieldChange(param.id, val, true)}
            className={className}
          />
        )
      }
      case AssetParameterType.OPTIONS: {
        return (
          <OptionsField
            id={parameterId}
            key={parameterId}
            label={param.label}
            value={values[param.id] as string}
            options={param.options!}
            onChange={val => this.handleFieldChange(param.id, val)}
            className={className}
          />
        )
      }
      case AssetParameterType.FLOAT: {
        return (
          <NumberField
            id={parameterId}
            key={parameterId}
            label={param.label}
            value={values[param.id] as number}
            onChange={val => this.handleFieldChange(param.id, val, true)}
            className={className}
            allowFloat
          />
        )
      }
      case AssetParameterType.TEXTAREA: {
        return (
          <TextAreaField
            id={parameterId}
            key={parameterId}
            label={param.label}
            value={values[param.id] as string}
            onChange={val => this.handleFieldChange(param.id, val, true)}
            className={className}
          />
        )
      }
      case AssetParameterType.SLIDER: {
        return (
          <SliderField
            id={parameterId}
            key={parameterId}
            label={param.label}
            min={param.min as number}
            max={param.max as number}
            step={param.step as number}
            value={values[param.id] as number}
            onChange={val => this.handleFieldChange(param.id, val, true)}
            className={className}
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
