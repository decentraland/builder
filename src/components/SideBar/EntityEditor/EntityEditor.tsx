import * as React from 'react'
import { Header } from 'decentraland-ui'
import { debounce } from 'lib/debounce'
import { AssetParameterValues } from 'modules/asset/types'
import EntityParameters from './EntityParameters'
import { Props } from './EntityEditor.types'
import './EntityEditor.css'

export default class EntityEditor extends React.PureComponent<Props> {
  handleChangeDebounced = debounce((parameters: AssetParameterValues) => {
    const { entityId, onSetScriptParameters } = this.props
    onSetScriptParameters(entityId, parameters)
  }, 200)

  render() {
    const { asset, script } = this.props

    if (!asset) return null

    return (
      <div className="EntityEditor">
        <Header className="header" size="medium">
          {asset.name}
        </Header>
        <div className="thumbnail">
          <img src={asset.thumbnail} alt={asset.name} />
        </div>
        <EntityParameters parameters={asset.parameters} values={script.data!.parameters} onChange={this.handleChangeDebounced} />
      </div>
    )
  }
}
