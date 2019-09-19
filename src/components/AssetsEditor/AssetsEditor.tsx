import * as React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import SingleAssetEditor from 'components/AssetsEditor/SingleAssetEditor'
import { MAX_TAGS, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from 'modules/asset/utils'
import { RawAssetPack } from 'modules/assetPack/types'
import { RawAsset } from 'modules/asset/types'
import { Props, State } from './AssetsEditor.types'
import './AssetsEditor.css'

export default class AssetsEditor extends React.PureComponent<Props, State> {
  state: State = {
    currentAsset: 0,
    errors: {},
    isDirty: false
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

  getErrors = (asset: RawAsset) => {
    const { errors } = this.state
    const newErrors: Record<string, string> = {}

    if (asset.tags && asset.tags.length > MAX_TAGS) {
      newErrors.tags = t('asset_pack.edit_asset.errors.tag_count', {
        count: MAX_TAGS
      })
    }

    if (asset.name.length > MAX_NAME_LENGTH) {
      newErrors.name = t('asset_pack.edit_asset.errors.max_name_length', {
        count: MAX_NAME_LENGTH
      })
    }

    if (asset.name.length < MIN_NAME_LENGTH) {
      newErrors.name = t('asset_pack.edit_asset.errors.min_name_length', {
        count: MIN_NAME_LENGTH
      })
    }

    const hasErrors = Object.keys(newErrors).length > 0

    if (errors[asset.id] && !hasErrors) {
      // Remove key from dictionary if all errors are fixed
      const { [asset.id]: _, ...newState } = errors
      return newState
    } else if (hasErrors) {
      return { ...errors, [asset.id]: newErrors }
    }

    return errors
  }

  getAssetPackErrors = (assetPack: RawAssetPack) => {
    let errors: Record<string, Record<string, string>> = {}
    for (let asset of assetPack.assets) {
      errors = { ...errors, ...this.getErrors(asset) }
    }
    return errors
  }

  handleChange = (asset: RawAsset) => {
    const { assetPack } = this.props
    const { currentAsset, isDirty } = this.state

    if (isDirty) {
      const errors = this.getErrors(asset)
      this.setState({ errors: errors })
    }

    if (assetPack) {
      const assets = [...assetPack.assets]
      assets[currentAsset] = asset

      this.props.onChange({
        ...assetPack,
        assets
      })
    }
  }

  getAssetIndex = (assetId: string) => {
    const { assetPack } = this.props
    for (let i = 0; i < assetPack.assets.length; i++) {
      const asset = assetPack.assets[i]
      if (asset.id === assetId) {
        return i
      }
    }
    return -1
  }

  handleSubmit = () => {
    const { assetPack } = this.props
    const { currentAsset } = this.state
    const errors = this.getAssetPackErrors(assetPack)
    const errorKeys = Object.keys(errors)
    const hasErrors = errorKeys.length > 0

    this.setState({
      isDirty: true,
      errors,
      currentAsset: hasErrors ? this.getAssetIndex(errorKeys[0]) : currentAsset
    })

    if (!hasErrors) {
      this.props.onSubmit(this.props.assetPack)
    }
  }

  getAssets() {
    const { assetPack, isEditing } = this.props
    let assets = []

    for (let asset of assetPack.assets) {
      if (isEditing || (!isEditing && asset.metadata)) {
        assets.push(asset)
      }
    }

    return assets
  }

  render() {
    const { assetPack } = this.props
    const { currentAsset, errors, isDirty } = this.state
    const isFirst = currentAsset === 0
    const isLast = currentAsset === assetPack.assets.length - 1
    const hasErrors = Object.keys(errors).length > 0
    const isSubmitDisabled = isDirty ? hasErrors : false
    const assets = this.getAssets()
    const asset = assets[currentAsset]
    debugger
    const currentAssetError = errors[asset.id]
    return (
      <div className="AssetsEditor">
        <SingleAssetEditor asset={asset} onChange={this.handleChange} errors={currentAssetError} />

        <div className="actions">
          {assets.length > 1 && (
            <div className="pagination">
              <Button onClick={this.handlePrev} icon="angle left" disabled={isFirst} />
              <span className="current">
                {currentAsset + 1}/{assetPack.assets.length}
              </span>
              <Button onClick={this.handleNext} icon="angle right" disabled={isLast} />
            </div>
          )}

          <Button className="submit" primary={isLast} disabled={isSubmitDisabled} onClick={this.handleSubmit}>
            {isLast ? t('asset_pack.edit_asset.action') : t('asset_pack.edit_asset.action_skip')}
          </Button>
        </div>
      </div>
    )
  }
}
