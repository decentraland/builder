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
  }, 100)

  render() {
    const { asset, script, entity } = this.props

    if (!asset) return null

    return (
      <div className="EntityEditor">
        <Header className="header" size="medium">
          <div className="spacer" />
          {asset.name} ({entity.name})
          <Icon name="modal-close" onClick={this.props.onClose} />
        </Header>
        <div className="thumbnail">
          <img src={asset.thumbnail} alt={asset.name} />
        </div>
        <EntityParameters parameters={asset.parameters} values={script.data!.values} onChange={this.handleChangeDebounced} />
      </div>
    )
  }
}
