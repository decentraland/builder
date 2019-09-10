import * as React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import SingleAssetEditor from 'components/AssetsEditor/SingleAssetEditor'
import { MAX_TAGS, MAX_NAME_LENGTH } from 'modules/asset/utils'
import { RawAsset } from 'modules/asset/types'
import { Props, State } from './AssetsEditor.types'
import './AssetsEditor.css'

export default class AssetsEditor extends React.PureComponent<Props, State> {
  state: State = {
    currentAsset: 0,
    errors: {}
  }

  componentDidMount() {
    const { assetPack } = this.props
    const { currentAsset } = this.state
    this.handleErrors(assetPack.assets[currentAsset])
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
    const { errors } = this.state
    const newErrors: Record<string, string> = {}

    if (asset.tags && asset.tags.length > MAX_TAGS) {
      newErrors.tags = t('asset_pack.edit_asset.errors.tag_count', {
        count: MAX_TAGS
      })
    }

    if (asset.name.length > MAX_NAME_LENGTH) {
      newErrors.name = t('asset_pack.edit_asset.errors.name_length', {
        count: MAX_NAME_LENGTH
      })
    }

    const hasErrors = Object.keys(newErrors).length > 0

    if (hasErrors) {
      this.setState({ errors: { ...errors, [asset.id]: newErrors } })
    } else if (errors[asset.id] && !hasErrors) {
      // Remove key from dictionary if all errors are fixed
      const { [asset.id]: _, ...newState } = errors
      this.setState({ errors: newState })
    }
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
    const { currentAsset, errors } = this.state
    const isFirst = currentAsset === 0
    const isLast = currentAsset === assetPack.assets.length - 1
    const asset = assetPack.assets[currentAsset]
    const hasErrors = Object.keys(errors).length
    const currentAssetError = errors[asset.id]

    return (
      <div className="AssetsEditor">
        <SingleAssetEditor asset={asset} onChange={this.handleChange} errors={currentAssetError} />

        <div className="actions">
          {assetPack.assets.length > 1 && (
            <div className="pagination">
              <Button onClick={this.handlePrev} icon="angle left" disabled={isFirst || !!currentAssetError} />
              <span className="current">
                {currentAsset + 1}/{assetPack.assets.length}
              </span>
              <Button onClick={this.handleNext} icon="angle right" disabled={isLast || !!currentAssetError} />
            </div>
          )}

          <Button className="submit" primary={isLast} disabled={!!hasErrors} onClick={this.handleSubmit}>
            {isLast ? t('asset_pack.edit_asset.action') : t('asset_pack.edit_asset.action_skip')}
          </Button>
        </div>
      </div>
    )
  }
}
