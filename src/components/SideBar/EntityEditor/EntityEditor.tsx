import * as React from 'react'
import { Header } from 'decentraland-ui'
import { debounce } from 'lib/debounce'
import Icon from 'components/Icon'
import { AssetParameterValues } from 'modules/asset/types'
import EntityParameters from './EntityParameters'
import { Props } from './EntityEditor.types'
import './EntityEditor.css'

export default class EntityEditor extends React.PureComponent<Props> {
  handleChangeDebounced = debounce((parameters: AssetParameterValues) => {
    const { entityId, onSetScriptParameters } = this.props
    onSetScriptParameters(entityId, parameters)
  }, 150)

  render() {
    const { asset, script, entity } = this.props

    if (!asset) return null

    return (
      <div className="EntityEditor">
        <Header className="header" size="medium">
          <div className="spacer" />
          <div className="title">
            <span className="asset">{asset.name}</span>
            <span className="entity">{entity.name}</span>
          </div>
          <Icon name="modal-close" onClick={this.props.onDeselect} />
        </Header>
        <div className="overflow-container">
          <div className="thumbnail">
            <img src={asset.thumbnail} alt={asset.name} />
          </div>
          <div className="parameters">
            <EntityParameters
              entityName={entity.name}
              parameters={asset.parameters}
              values={script.data!.values}
              onChange={this.handleChangeDebounced}
            />
          </div>
        </div>
      </div>
    )
  }
}
