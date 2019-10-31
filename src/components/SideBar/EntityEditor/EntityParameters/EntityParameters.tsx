import * as React from 'react'
import { AssetParameter, AssetParameterType } from 'modules/asset/types'
import TextField from '../TextField'
import NumberField from '../NumberField'
import BooleanField from '../BooleanField'
import EntityField from '../EntityField'

import { Props } from './EntityParameters.types'

export default class EntityParameters extends React.PureComponent<Props> {
  renderField = (param: AssetParameter) => {
    const { values, onChange } = this.props

    switch (param.type) {
      case AssetParameterType.ENTITY: {
        return <EntityField id={param.id} label={param.label} value={values[param.id] as string} onChange={onChange} />
      }
      case AssetParameterType.STRING: {
        return <TextField id={param.id} label={param.label} value={values[param.id] as string} onChange={onChange} />
      }
      case AssetParameterType.BOOLEAN: {
        return <BooleanField id={param.id} label={param.label} value={values[param.id] as boolean} onChange={onChange} />
      }
      case AssetParameterType.INTEGER: {
        return <NumberField id={param.id} label={param.label} value={values[param.id] as number} onChange={onChange} />
      }
      case AssetParameterType.FLOAT: {
        return <NumberField id={param.id} label={param.label} value={values[param.id] as number} onChange={onChange} allowFloat />
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
