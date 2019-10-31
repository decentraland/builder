import * as React from 'react'
import { Header } from 'decentraland-ui'
import { debounce } from 'lib/debounce'
import EntityParameters from './EntityParameters'
import { Props, State } from './EntityEditor.types'
import './EntityEditor.css'

export default class EntityEditor extends React.PureComponent<Props, State> {
  state: State = {
    values: {}
  }

  handleChangeDebounced = debounce(() => {
    const { entityId, onSetScriptParameters } = this.props
    const { values: parameters } = this.state
    onSetScriptParameters(entityId, parameters)
  }, 200)

  componentWillMount() {
    this.setState({
      values: { ...this.props.script.data.parameters }
    })
  }

  handleFieldChange = (id: string, value: any) => {
    this.setState({
      values: { ...this.state.values, [id]: value }
    })

    this.handleChangeDebounced()
  }

  render() {
    const { asset } = this.props
    const { values } = this.state

    if (!asset) return null

    return (
      <div className="EntityEditor">
        <Header className="header" size="medium">
          {asset.name}
        </Header>
        <div className="thumbnail">
          <img src={asset.thumbnail} alt={asset.name} />
        </div>
        <EntityParameters parameters={asset.parameters} values={values} onChange={this.handleFieldChange} />
      </div>
    )
  }
}
