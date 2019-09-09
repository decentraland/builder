import * as React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import AssetEditor from 'components/AssetEditor'
import { Props, State } from './AssetPackAssetsEditor.types'
import './AssetPackAssetsEditor.css'
import { RawAsset } from 'modules/asset/types'

export default class AssetPackAssetsEditor extends React.PureComponent<Props, State> {
  state: State = {
    currentAsset: 0
  }

  handlePrev = () => {
    this.setState({
      currentAsset: Math.max(this.state.currentAsset - 1, 0)
    })
  }

  handleNext = () => {
    this.setState({
      currentAsset: Math.min(this.state.currentAsset + 1, this.props.assetPack.assets.length - 1)
    })
  }

  handleSubmit = () => {
    this.props.onSubmit(this.props.assetPack)
  }

  handleChange = (asset: RawAsset) => {
    const { assetPack } = this.props
    const { currentAsset } = this.state

    if (assetPack) {
      const assets = [...assetPack.assets]
      assets[currentAsset] = asset

      this.props.onChange({
        ...assetPack,
        assets
      })
    }
  }

  render() {
    const { assetPack } = this.props
    const { currentAsset } = this.state
    const isFirst = currentAsset === 0
    const isLast = currentAsset === assetPack.assets.length - 1

    return (
      <div className="AssetPackAssetsEditor">
        <AssetEditor asset={assetPack.assets[currentAsset]} onChange={this.handleChange} />

        <div className="actions">
          <div className="pagination">
            <Button onClick={this.handlePrev} icon="angle left" disabled={isFirst} />
            <span className="current">
              {currentAsset + 1}/{assetPack.assets.length}
            </span>
            <Button onClick={this.handleNext} icon="angle right" disabled={isLast} />
          </div>

          <Button primary={isLast} onClick={this.handleSubmit}>
            {isLast ? t('asset_pack.edit_asset.action') : t('asset_pack.edit_asset.action_skip')}
          </Button>
        </div>
      </div>
    )
  }
}
