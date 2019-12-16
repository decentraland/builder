import * as React from 'react'
import { Button } from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import SingleAssetEditor from 'components/AssetsEditor/SingleAssetEditor'
import { MAX_TAGS, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from 'modules/asset/utils'
import { RawAssetPack, MixedAssetPack } from 'modules/assetPack/types'
import { RawAsset } from 'modules/asset/types'
import { Props, State } from './AssetsEditor.types'
import './AssetsEditor.css'

export default class AssetsEditor<T extends MixedAssetPack = RawAssetPack> extends React.PureComponent<Props<T>, State> {
  state: State = {
    currentAsset: this.getStartingAsset(),
    errors: {},
    isDirty: false
  }

  analytics = getAnalytics()

  getAssets() {
    const { assetPack, ignoredAssets } = this.props
    let assets = []
    for (let asset of assetPack.assets) {
      if (ignoredAssets && ignoredAssets.length > 0 && ignoredAssets.includes(asset.id)) {
        continue
      }
      assets.push(asset)
    }

    return assets
  }

  getStartingAsset() {
    const { startingAsset } = this.props
    if (!startingAsset) return 0

    const assets = this.getAssets()
    const found = assets.findIndex(asset => asset.id === startingAsset)
    return found === -1 ? 0 : found
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

  getErrors = (asset: T['assets'][number]) => {
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

  getAssetPackErrors = () => {
    let errors: Record<string, Record<string, string>> = {}
    for (let asset of this.getAssets()) {
      errors = { ...errors, ...this.getErrors(asset) }
    }
    return errors
  }

  handleChange = (asset: RawAsset) => {
    const { assetPack } = this.props
    const { isDirty } = this.state

    if (isDirty) {
      const errors = this.getErrors(asset)
      this.setState({ errors: errors })
    }

    if (assetPack) {
      const assets = [...assetPack.assets]
      const index = assets.findIndex(a => a.id === asset.id)
      assets[index] = asset

      this.props.onChange({
        ...assetPack,
        assets
      })
    }
  }

  getAssetIndex = (assetId: string) => {
    const assets = this.getAssets()
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i]
      if (asset.id === assetId) {
        return i
      }
    }
    return 0
  }

  handleSubmit = () => {
    const { currentAsset } = this.state
    const errors = this.getAssetPackErrors()
    const errorKeys = Object.keys(errors)
    const hasErrors = errorKeys.length > 0
    const assets = this.getAssets()
    const isLast = currentAsset === assets.length - 1

    if (!isLast) {
      this.analytics.track('Asset Review Skip')
    }

    this.setState({
      isDirty: true,
      errors,
      currentAsset: hasErrors ? this.getAssetIndex(errorKeys[0]) : currentAsset
    })

    if (!hasErrors) {
      this.props.onSubmit(this.props.assetPack)
    }
  }

  render() {
    const { isEditing } = this.props
    const { currentAsset, errors, isDirty } = this.state
    const hasErrors = Object.keys(errors).length > 0
    const isSubmitDisabled = isDirty ? hasErrors : false
    const assets = this.getAssets()
    const isFirst = currentAsset === 0
    const isLast = currentAsset === assets.length - 1
    const asset = assets[currentAsset]
    const currentAssetError = errors[asset.id]

    let paginationClasses = 'pagination'

    return (
      <div className="AssetsEditor">
        <SingleAssetEditor asset={asset} onChange={this.handleChange} errors={currentAssetError} />

        <div className="actions">
          {assets.length > 1 && (
            <div className={paginationClasses}>
              <Button onClick={this.handlePrev} icon="angle left" disabled={isFirst} />
              <span className="current">
                {currentAsset + 1}/{assets.length}
              </span>
              <Button onClick={this.handleNext} icon="angle right" disabled={isLast} />
            </div>
          )}

          <Button className="submit" primary={isLast || isEditing} disabled={isSubmitDisabled} onClick={this.handleSubmit}>
            {isEditing && t('global.save')}
            {!isEditing && (isLast ? t('asset_pack.edit_asset.action') : t('asset_pack.edit_asset.action_skip'))}
          </Button>
        </div>
      </div>
    )
  }
}
