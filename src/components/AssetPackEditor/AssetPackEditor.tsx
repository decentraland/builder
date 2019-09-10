import * as React from 'react'
import { Field, Header, Button } from 'decentraland-ui'
import AssetThumbnail from 'components/AssetThumbnail'
import { RawAssetPack } from 'modules/assetPack/types'
import { isGround } from 'modules/asset/utils'
import Icon from 'components/Icon'

import { Props, State } from './AssetPackEditor.types'
import './AssetPackEditor.css'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { MAX_NAME_LENGTH, MAX_THUMBNAIL_SIZE } from 'modules/assetPack/utils'

export default class AseetPackEditor<T extends RawAssetPack> extends React.PureComponent<Props<T>, State> {
  thumbnailInput = React.createRef<HTMLInputElement>()

  state: State = {
    errors: {}
  }

  componentDidMount() {
    const { assetPack, onChange } = this.props

    if (!assetPack.thumbnail) {
      const asset = assetPack.assets.length ? assetPack.assets.find(asset => !isGround(asset)) : null
      onChange({
        ...assetPack,
        thumbnail: asset ? asset.thumbnail : ''
      })
    }
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

  handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { assetPack, onChange } = this.props
    const { files } = e.target

    if (files) {
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

    const title = e.target.value
    const newPack = { ...assetPack, title }

    this.handleErrors(newPack)

    onChange(newPack)
  }

  handleErrors = (assetPack: RawAssetPack) => {
    const newErrors: Record<string, string> = {}

    if (assetPack.title.length > MAX_NAME_LENGTH) {
      newErrors.title = t('asset_pack.edit_assetpack.errors.title_length', {
        count: MAX_NAME_LENGTH
      })
    }

    const hasErrors = Object.keys(newErrors).length > 0

    this.setState({ errors: hasErrors ? newErrors : {} })
  }

  handleSubmit = () => {
    this.props.onSubmit(this.props.assetPack)
  }

  render() {
    const { assetPack } = this.props
    const { errors } = this.state
    const items = assetPack ? assetPack.assets.length : 0
    const hasErrors = Object.keys(errors).length > 0
    const isSubmitDisabled = hasErrors || items === 0 || assetPack.title.trim().length === 0

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
            <Header sub>{t('asset_pack.edit_assetpack.items.label', { count: items })}</Header>
          </div>
          <div className="content">
            {assetPack && assetPack.assets.map(asset => <AssetThumbnail key={asset.id} asset={asset} onRemove={this.handleRemove} />)}
          </div>
        </div>

        <div className="actions">
          <Button className="submit" disabled={isSubmitDisabled} onClick={this.handleSubmit} primary>
            {t('asset_pack.edit_assetpack.action')}
          </Button>
        </div>
      </div>
    )
  }
}
