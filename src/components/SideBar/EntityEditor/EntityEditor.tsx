import * as React from 'react'
import { Header } from 'decentraland-ui'
import { debounce } from 'lib/debounce'
import { AssetParameter, AssetParameterType } from 'modules/asset/types'
import TextField from './TextField'
import NumberField from './NumberField'
import BooleanField from './BooleanField'
import { Props, State } from './EntityEditor.types'
import './EntityEditor.css'

export default class EntityEditor extends React.PureComponent<Props, State> {
  state: State = {
    parameters: {}
  }

  handleChangeDebounced = debounce(() => {
    const { entityId, onSetScriptParameters } = this.props
    const { parameters } = this.state
    onSetScriptParameters(entityId, parameters)
  }, 200)

  componentWillMount() {
    this.setState({
      parameters: { ...this.props.script.data.parameters }
    })
  }

  handleFieldChange = (id: string, value: any) => {
    this.setState({
      parameters: { ...this.state.parameters, [id]: value }
    })

    this.handleChangeDebounced()
  }

  renderField = (param: AssetParameter) => {
    const { parameters } = this.state

    switch (param.type) {
      case AssetParameterType.STRING: {
        return <TextField id={param.id} label={param.label} value={parameters[param.id] as string} onChange={this.handleFieldChange} />
      }
      case AssetParameterType.BOOLEAN: {
        return <BooleanField id={param.id} label={param.label} value={parameters[param.id] as boolean} onChange={this.handleFieldChange} />
      }
      case AssetParameterType.INTEGER: {
        return <NumberField id={param.id} label={param.label} value={parameters[param.id] as number} onChange={this.handleFieldChange} />
      }
      case AssetParameterType.FLOAT: {
        return (
          <NumberField
            id={param.id}
            label={param.label}
            value={parameters[param.id] as number}
            onChange={this.handleFieldChange}
            allowFloat
          />
        )
      }
      default:
        return null
    }
  }

  render() {
    const { asset } = this.props
    if (!asset) return null

    return (
      <div className="EntityEditor">
        <Header className="header" size="medium">
          {asset.name}
        </Header>
        <div className="thumbnail">
          <img src={asset.thumbnail} alt={asset.name} />
        </div>
        {asset.parameters.map(param => this.renderField(param))}
      </div>
    )
  }
}
