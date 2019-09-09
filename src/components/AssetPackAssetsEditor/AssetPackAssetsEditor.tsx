import * as React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import AssetEditor from 'components/AssetEditor'
import { RawAsset } from 'modules/asset/types'
import { Props, State } from './AssetPackAssetsEditor.types'
import './AssetPackAssetsEditor.css'

export default class AssetPackAssetsEditor extends React.PureComponent<Props, State> {
  state: State = {
    currentAsset: 0,
    errors: {}
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

  handleErrors = (asset: RawAsset) => {
    const errors: Record<string, string> = {}

    if (asset.tags && asset.tags.length > 5) {
      errors.tags = 'You can only specify a maximum of 5 tags'
    }

    if (asset.name.length > 20) {
      errors.tags = 'Asset names can only be up to 20 characters long'
    }
    this.setState({ errors })
  }

  handleChange = (asset: RawAsset) => {
    const { assetPack } = this.props
    const { currentAsset } = this.state

    this.handleErrors(asset)

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
