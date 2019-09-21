import * as React from 'react'
import { Field, Header, Button, Icon as SemanticIcon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { MAX_TITLE_LENGTH, MAX_THUMBNAIL_SIZE, MIN_TITLE_LENGTH } from 'modules/assetPack/utils'
import { RawAssetPack, MixedAssetPack } from 'modules/assetPack/types'
import { isGround } from 'modules/asset/utils'
import AssetThumbnail from 'components/AssetThumbnail'
import Icon from 'components/Icon'

import { Props, State } from './AssetPackEditor.types'
import './AssetPackEditor.css'

export default class AseetPackEditor<T extends MixedAssetPack = RawAssetPack> extends React.PureComponent<Props<T>, State> {
  thumbnailInput = React.createRef<HTMLInputElement>()

  state: State = {
    errors: {},
    isDirty: false
  }

  componentDidMount() {
    const { assetPack, onChange } = this.props

    if (!assetPack.thumbnail) {
      let thumb: string | null = null

      if (assetPack.assets.length) {
        const foundAsset = assetPack.assets.find(asset => !isGround(asset))
        if (foundAsset) {
          thumb = foundAsset.thumbnail
        } else {
          thumb = assetPack.assets[0].thumbnail
        }
      }

      onChange({
        ...assetPack,
        thumbnail: thumb || ''
      })
    }
  }

  getErrors = (assetPack: T) => {
    const newErrors: Record<string, string> = {}

    if (assetPack.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = t('asset_pack.edit_assetpack.errors.max_title_length', {
        count: MAX_TITLE_LENGTH
      })
    }

    if (assetPack.title.length < MIN_TITLE_LENGTH) {
      newErrors.title = t('asset_pack.edit_assetpack.errors.min_title_length', {
        count: MIN_TITLE_LENGTH
      })
    }

    const hasErrors = Object.keys(newErrors).length > 0

    return hasErrors ? newErrors : {}
  }

  handleRemove = (id: string) => {
    const { assetPack, onChange } = this.props

    onChange({
      ...assetPack,
      assets: assetPack.assets.filter(asset => asset.id !== id)
    })
  }

  handleOpenFileDialog = () => {
    if (this.thumbnailInput.current) {
      this.thumbnailInput.current.click()
    }
  }

  handleSetDirty = () => {
    this.setState({
      isDirty: true,
      errors: this.getErrors(this.props.assetPack)
    })
  }

  handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { assetPack, onChange } = this.props
    const { files } = e.target

    if (files && files.length > 0) {
      const file = files[0]
      if (file.size > MAX_THUMBNAIL_SIZE) {
        alert(
          t('asset_pack.edit_assetpack.errors.thumbnail_size', {
            count: MAX_THUMBNAIL_SIZE
          })
        )
        return
      }
      const url = URL.createObjectURL(file)

      onChange({
        ...assetPack,
        thumbnail: url
      })
    }
  }

  handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { assetPack, onChange } = this.props
    const { isDirty } = this.state

    const title = e.target.value
    const newPack = { ...assetPack, title }

    if (isDirty) {
      this.setState({
        errors: this.getErrors(newPack)
      })
    }

    onChange(newPack)
  }

  handleSubmit = () => {
    const errors = this.getErrors(this.props.assetPack)
    const hasErrors = Object.keys(errors).length > 0

    this.setState({
      isDirty: true,
      errors
    })

    if (!hasErrors) {
      this.props.onSubmit(this.props.assetPack)
    }
  }

  handleAddItems = () => {
    const { onAddAssets: onAddItems } = this.props
    if (onAddItems) {
      onAddItems()
    }
  }

  handleEditAsset = (asset: T['assets'][number]) => {
    const { onEditAsset } = this.props
    if (onEditAsset) {
      onEditAsset(asset)
    }
  }

  handleDeleteAssetPack = () => {
    const { assetPack, onDeleteAssetPack } = this.props

    if (onDeleteAssetPack) {
      onDeleteAssetPack(assetPack)
    }
  }

  renderAssets = () => {
    const { assetPack } = this.props
    return assetPack.assets.map(asset => (
      <AssetThumbnail key={asset.id} asset={asset} onRemove={this.handleRemove} onClick={this.handleEditAsset} hideLabel />
    ))
  }

  renderEmptyState = () => {
    const { onReset } = this.props
    return (
      <div className="no-items">
        {t('asset_pack.edit_assetpack.items.empty')}
        <Button basic onClick={onReset}>
          {t('asset_pack.edit_assetpack.reset')}
        </Button>
      </div>
    )
  }

  render() {
    const { assetPack, error, onAddAssets: onAddItems, onDeleteAssetPack } = this.props
    const { errors, isDirty } = this.state
    const items = assetPack ? assetPack.assets.length : 0
    const hasErrors = Object.keys(errors).length > 0
    const isSubmitDisabled = isDirty ? hasErrors || items === 0 : false

    return (
      <div className="AssetPackEditor">
        <div className="assetpack">
          <div className="thumbnail">
            {assetPack.thumbnail && <img src={assetPack.thumbnail} />}
            <Icon name="camera" onClick={this.handleOpenFileDialog} />
            <input type="file" ref={this.thumbnailInput} onChange={this.handleThumbnail} accept="image/png, image/jpeg" />
          </div>
          <Field
            label={t('asset_pack.edit_assetpack.name.label')}
            placeholder={t('asset_pack.edit_assetpack.name.placeholder')}
            onChange={this.handleChangeName}
            error={hasErrors}
            message={errors.title}
            value={assetPack.title}
          />
        </div>

        <div className="assets">
          <div className="header">
            {items > 0 && <Header sub>{t('asset_pack.edit_assetpack.items.label', { count: items })}</Header>}
            {onAddItems && items > 0 && (
              <Button basic onClick={this.handleAddItems}>
                {t('asset_pack.edit_assetpack.action_add_items')}
              </Button>
            )}
          </div>
          <div className="content">{assetPack && items > 0 ? this.renderAssets() : this.renderEmptyState()}</div>
        </div>

        {error ? (
          <div className="error">
            {t('global.error_ocurred')} "{error}"
          </div>
        ) : null}

        <div className="actions">
          {onDeleteAssetPack && (
            <Button primary inverted onClick={this.handleDeleteAssetPack}>
              <SemanticIcon name="trash" />
              {t('asset_pack.edit_assetpack.action_delete')}
            </Button>
          )}
          <Button className="submit" disabled={isSubmitDisabled} onClick={this.handleSubmit} primary>
            {onDeleteAssetPack ? t('asset_pack.edit_assetpack.action_edit') : t('asset_pack.edit_assetpack.action_create')}
          </Button>
        </div>
      </div>
    )
  }
}
